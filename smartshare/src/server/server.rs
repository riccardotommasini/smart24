use operational_transform::OperationSeq;
use smartshare::file::File;
use smartshare::protocol::msg::{MessageServer, ModifRequest};
use tokio::sync::mpsc;
use tracing::{error, info, trace, warn};

use crate::client::Client;

pub struct Server {
    clients: Vec<Client>,
    receiver: mpsc::Receiver<ServerMessage>,
    deltas: Vec<OperationSeq>,
    file: Option<File>,
}

impl Server {
    pub fn new() -> (Self, ServerHandle) {
        let (tx, rx) = mpsc::channel(16);
        (
            Self {
                deltas: vec![],
                clients: vec![],
                receiver: rx,
                file: None,
            },
            ServerHandle { sender: tx },
        )
    }

    pub async fn run(&mut self) {
        while let Some(message) = self.receiver.recv().await {
            match message {
                ServerMessage::Message(client_id, message) => {
                    self.on_message(client_id, message).await
                }
                ServerMessage::Connect(client) => self.on_connect(client).await,
                ServerMessage::Disctonnect(client_id) => self.on_disconnect(client_id).await,
            }
        }
    }

    async fn on_connect(&mut self, client: Client) {
        info!("New client connected: {}", client.id());
        match &self.file {
            Some(file) => {
                let _ = client
                    .send(MessageServer::File {
                        file: file.to_string(),
                        version: self.deltas.len() - 1,
                    })
                    .await;
            }
            None => {
                if client.send(MessageServer::RequestFile).await.is_err() {
                    return;
                }
            }
        }
        self.clients.push(client);
    }

    async fn send_to_client(&self, client_id: usize, message: MessageServer) {
        if let Some(client) = self.clients.iter().find(|client| client.id() == client_id) {
            let _ = client.send(message).await;
        }
    }

    async fn on_disconnect(&mut self, client_id: usize) {
        info!("Client disconnected: {client_id}");
        self.clients.retain(|client| client.id() != client_id);
    }

    async fn on_update(&mut self, source_id: usize, req: ModifRequest) {
        let Some(file) = self.file.as_mut() else {
            error!("Client {source_id} sent modifications before file was initialized");
            self.send_to_client(
                source_id,
                MessageServer::Error {
                    error: "File not initialized".into(),
                },
            )
            .await;

            return;
        };

        if req.rev_num >= self.deltas.len() {
            todo!("gestion d'un revision number invalide");
        } else {
            let mut delta_p = req.delta;
            for i in req.rev_num + 1..self.deltas.len() {
                (_, delta_p) = self.deltas[i].transform(&delta_p).unwrap();
            }
            file.apply(&delta_p).unwrap();
            self.deltas.push(delta_p.clone());
            for client in self.clients.iter() {
                let notif = if client.id() == source_id {
                    MessageServer::Ack
                } else {
                    MessageServer::ServerUpdate(ModifRequest {
                        delta: delta_p.clone(),
                        rev_num: self.deltas.len() - 1,
                    })
                };
                if client.send(notif).await.is_err() {
                    warn!(
                        "Could not send message to client {}. Maybe it is disconnected ?",
                        client.id()
                    );
                }
            }
        }
    }

    async fn on_file(&mut self, source_id: usize, file: String, version: usize) {
        if version != 0 {
            self.send_to_client(
                source_id,
                MessageServer::Error {
                    error: "First version should be 0".into(),
                },
            )
            .await;
            return;
        }

        if self.file.is_some() {
            self.send_to_client(
                source_id,
                MessageServer::Error {
                    error: "File is already initialized".into(),
                },
            )
            .await;
            return;
        }

        let file = File::new(&file);

        let mut delta = OperationSeq::default();
        delta.retain(file.len_chars() as u64);
        self.deltas.push(delta);

        self.file = Some(file);
    }

    async fn on_cursor_move(&mut self, source_id: usize, offset: u64, range: u64) {
        for client in self
            .clients
            .iter()
            .filter(|client| client.id() != source_id)
        {
            let _ = client
                .send(MessageServer::Cursor {
                    id: source_id,
                    offset,
                    range,
                })
                .await;
        }
    }

    async fn on_message(&mut self, source_id: usize, message: MessageServer) {
        trace!("User message: {:?}", message);

        match message {
            MessageServer::ServerUpdate(req) => self.on_update(source_id, req).await,
            MessageServer::File { file, version } => self.on_file(source_id, file, version).await,
            MessageServer::Cursor { offset, range, .. } => {
                self.on_cursor_move(source_id, offset, range).await
            }
            _ => warn!("Received unexpected message type {:?}", message),
        }
    }
}

enum ServerMessage {
    Message(usize, MessageServer),
    Connect(Client),
    Disctonnect(usize),
}

#[derive(Clone)]
pub struct ServerHandle {
    sender: mpsc::Sender<ServerMessage>,
}

impl ServerHandle {
    pub async fn on_connect(&self, client: Client) {
        self.send(ServerMessage::Connect(client)).await;
    }

    pub async fn on_disconnect(&self, client_id: usize) {
        self.send(ServerMessage::Disctonnect(client_id)).await;
    }

    pub async fn on_message(&self, source_id: usize, message: MessageServer) {
        self.send(ServerMessage::Message(source_id, message)).await;
    }

    async fn send(&self, message: ServerMessage) {
        if self.sender.send(message).await.is_err() {
            error!("Server receiver has been drop");
            panic!("Server receiver has been drop");
        }
    }
}
