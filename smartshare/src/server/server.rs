use smartshare::protocol::msg::{Message, ModifRequest};
use tokio::sync::mpsc;
use tracing::{error, info, trace, warn};
use kyte::{Compose, Delta, Transform};

use crate::client::Client;

pub struct Server {
    clients: Vec<Client>,
    receiver: mpsc::Receiver<ServerMessage>,
    deltas: Vec<Delta<String, ()>>,
}

impl Server {
    pub fn new() -> (Self, ServerHandle) {
        let (tx, rx) = mpsc::channel(16);
        (
            Self {
                deltas: vec![Delta::new()],
                clients: vec![],
                receiver: rx,
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
        self.clients.push(client);
    }

    async fn on_disconnect(&mut self, client_id: usize) {
        info!("Client disconnected: {client_id}");
        self.clients.retain(|client| client.id() != client_id);
    }

    async fn on_message(&mut self, source_id: usize, message: Message) {
        trace!("User message: {:?}", message);

        match message {
            Message::ServerUpdate(req) => {
                if req.rev_num >= self.deltas.len() {
                    todo!("gestion d'un revision number invalide");
                } else {
                    let mut delta_p = req.delta;
                    for i in req.rev_num + 1..self.deltas.len() {
                        delta_p = self.deltas[i].clone().transform(delta_p.clone(), true);
                    }
                    self.deltas.push(delta_p.clone());
                    for client in self
                        .clients
                        .iter()
                        //.filter(|client| client.id() != source_id)
                    {
                        let notif: Message;
                        if client.id() == source_id {
                            notif = Message::Ack;
                        } else {
                            notif = Message::ServerUpdate(ModifRequest {
                                delta: delta_p.clone(),
                                rev_num: self.deltas.len() - 1,
                            })
                        }
                        if client.send(notif).await.is_err() {
                            warn!(
                                "Could not send message to client {}. Maybe it is disconnected ?",
                                client.id()
                            );
                        }
                    }
                }
            }
            _ => todo!(),
        }
    }
}

enum ServerMessage {
    Message(usize, Message),
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

    pub async fn on_message(&self, source_id: usize, message: Message) {
        self.send(ServerMessage::Message(source_id, message)).await;
    }

    async fn send(&self, message: ServerMessage) {
        if self.sender.send(message).await.is_err() {
            error!("Server receiver has been drop");
            panic!("Server receiver has been drop");
        }
    }
}
