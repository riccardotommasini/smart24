use operational_transform::OperationSeq;
use smartshare::protocol::msg::{
    modifs_to_operation_seq, to_ide_changes, Format, MessageIde, MessageServer, ModifRequest,
    TextModification,
};

use crate::ide::Ide;
use crate::server::Server;
use tracing::warn;

pub struct Client {
    server_state: OperationSeq,
    server_sent_delta: OperationSeq,
    server_unsent_delta: OperationSeq,
    ide_state: OperationSeq,
    ide_sent_delta: OperationSeq,
    ide_unsent_delta: OperationSeq,
    rev_num: usize,
    server: Server,
    ide: Ide,
    client_id: usize,
    format: Option<Format>,
    ide_ack: bool,
}

impl Client {
    pub fn new(server: Server, ide: Ide, client_id: usize) -> Self {
        Self {
            server_state: OperationSeq::default(),
            server_sent_delta: OperationSeq::default(),
            server_unsent_delta: OperationSeq::default(),
            ide_state: OperationSeq::default(),
            ide_sent_delta: OperationSeq::default(),
            ide_unsent_delta: OperationSeq::default(),
            rev_num: 0,
            server,
            ide,
            client_id,
            format: None,
            ide_ack: true,
        }
    }

    async fn on_ack(&mut self) {
        self.rev_num += 1;
        self.server_state = self.server_state.compose(&self.server_sent_delta).unwrap();
        self.server_sent_delta = OperationSeq::default();
        self.server_sent_delta
            .retain(self.server_state.target_len() as u64);
        if !self.server_unsent_delta.is_noop() {
            self.submit_server_change().await;
        }
    }

    async fn submit_server_change(&mut self) {
        let _ = self
            .server
            .send(MessageServer::ServerUpdate(ModifRequest {
                delta: self.server_unsent_delta.clone(),
                rev_num: self.rev_num,
            }))
            .await;
        self.server_sent_delta = self.server_unsent_delta.clone();
        self.server_unsent_delta = OperationSeq::default();
        self.server_unsent_delta
            .retain(self.server_sent_delta.target_len() as u64);
    }

    async fn on_server_error(&mut self, err: String) {
        self.ide.send(MessageIde::Error(err)).await;
    }

    async fn on_server_change(&mut self, modif: &ModifRequest) {
        self.rev_num += 1;
        if self.rev_num != modif.rev_num {
            todo!("handle desynchronisation");
        }
        let server_change = &modif.delta;

        let new_server_state = self.server_state.compose(server_change).unwrap();
        let (updated_server_change, new_server_sent_delta) =
            server_change.transform(&self.server_sent_delta).unwrap();
        let (ide_delta, new_server_unsent_delta) = updated_server_change
            .transform(&self.server_unsent_delta)
            .unwrap();

        self.server_state = new_server_state;
        self.server_sent_delta = new_server_sent_delta;
        self.server_unsent_delta = new_server_unsent_delta;

        self.ide_unsent_delta = self.ide_unsent_delta.compose(&modif.delta).unwrap();
        self.submit_ide_change().await;
    }

    async fn submit_ide_change(&mut self) {
        let ide_modifs = to_ide_changes(&self.ide_unsent_delta);
        self.ide.send(MessageIde::Update(ide_modifs)).await;
        self.ide_ack = false;
        self.ide_sent_delta = self.ide_unsent_delta.clone();
        self.ide_unsent_delta = OperationSeq::default();
        self.ide_unsent_delta
            .retain(self.ide_sent_delta.target_len() as u64);
    }

    async fn on_request_file(&mut self) {
        if self.format.is_none() {
            self.ide
                .send(MessageIde::Error(
                    "Error: MessageIde::RequestFile was sent by IDE but offset format is not set"
                        .into(),
                ))
                .await;
            return;
        }
        let _ = self.ide.send(MessageIde::RequestFile).await;
    }

    async fn on_receive_file(&mut self, file: String, version: usize) {
        self.ide.send(MessageIde::File(file)).await;
        self.rev_num = version
    }

    async fn on_ide_file(&mut self, file: String) {
        self.rev_num = 0;
        let _ = self
            .server
            .send(MessageServer::File { file, version: 0 })
            .await;
    }

    async fn on_ide_change(&mut self, change: &Vec<TextModification>) {
        
        let ide_seq = match modifs_to_operation_seq(
            &change,
            &(self.server_unsent_delta.target_len() as u64),
        ) {
            Ok(seq) => seq,
            Err(err) => {
                self.ide.send(MessageIde::Error(err.to_string())).await;
                return;
            }
        };
        
        if !self.ide_ack {
            let (updated_ide_change, new_ide_sent_delta) =
                ide_seq.transform(&self.ide_sent_delta).unwrap();
            let (server_delta, new_ide_unsent_delta) = updated_ide_change
                .transform(&self.ide_unsent_delta)
                .unwrap();

            self.server_unsent_delta = self
                .server_unsent_delta
                .compose(&ide_seq)
                .expect("modifs_to_operation_seq result should be length compatible with op_seq");

            self.ide_sent_delta = new_ide_sent_delta;
            self.ide_unsent_delta = new_ide_unsent_delta;

            /*(self.ide_sent_delta, _) = self.ide_sent_delta.transform(&ide_seq).unwrap();
            (self.ide_unsent_delta, _) = self.ide_unsent_delta.transform(&ide_seq).unwrap();*/

            self.ide.send(MessageIde::Ack).await;
            self.ide.send(MessageIde::Update(to_ide_changes(&self.ide_sent_delta))).await;

        } else {

            self.server_unsent_delta.compose(&ide_seq).unwrap();

            if self.server_sent_delta.is_noop() && !self.server_unsent_delta.is_noop() {
                self.submit_server_change().await;
            }
        }
    }

    async fn on_ide_format(&mut self, format: Format) {
        self.format = Some(format);
    }

    async fn on_ide_ack(&mut self) {
        if self.ide_ack {
            self.ide.send(MessageIde::Error("ack not ok".to_owned())).await;
        } else {
            if self.ide_unsent_delta.is_noop() {
                self.submit_ide_change().await;
            } else {
                self.ide_sent_delta = OperationSeq::default();
            }
        }
        
    }

    pub async fn on_message_server(&mut self, message: MessageServer) {
        match message {
            MessageServer::ServerUpdate(modif) => self.on_server_change(&modif).await,
            MessageServer::Ack => self.on_ack().await,
            MessageServer::Error(err) => self.on_server_error(err).await,
            MessageServer::RequestFile => self.on_request_file().await,
            MessageServer::File { file, version } => self.on_receive_file(file, version).await,
        }
    }

    pub async fn on_message_ide(&mut self, message_ide: MessageIde) {
        match message_ide {
            MessageIde::Update(change) => self.on_ide_change(&change).await,
            MessageIde::Declare(format) => self.on_ide_format(format).await,
            MessageIde::File(file) => self.on_ide_file(file).await,
            MessageIde::RequestFile => warn!("IDE sent RequestFile"),
            MessageIde::Error(_) => warn!("IDE sent error"),
            MessageIde::Ack => self.on_ide_ack().await,
        }
    }
}
