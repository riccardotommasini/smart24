use operational_transform::OperationSeq;
use smartshare::protocol::msg::{
    to_ide_changes, to_operation_seq, MessageIde, MessageServer, ModifRequest,
};

use crate::ide::Ide;
use crate::server::Server;

pub struct Client {
    server_state: OperationSeq,
    sent_delta: OperationSeq,
    unsent_delta: OperationSeq,
    rev_num: usize,
    server: Server,
    ide: Ide,
    client_id: usize,
}

impl Client {
    pub fn new(server: Server, ide: Ide, client_id: usize) -> Self {
        Self {
            server_state: OperationSeq::default(),
            sent_delta: OperationSeq::default(),
            unsent_delta: OperationSeq::default(),
            rev_num: 0,
            server,
            ide,
            client_id,
        }
    }

    async fn on_ack(&mut self) {
        self.rev_num += 1;
        self.server_state = self.server_state.compose(&self.sent_delta).unwrap();
        self.sent_delta = OperationSeq::default();
        self.sent_delta
            .retain(self.server_state.target_len() as u64);
        if !self.unsent_delta.is_noop() {
            self.submit_change().await;
        }
    }

    async fn submit_change(&mut self) {
        let _ = self
            .server
            .send(MessageServer::ServerUpdate(ModifRequest {
                delta: self.unsent_delta.clone(),
                rev_num: self.rev_num,
            }))
            .await;
        self.sent_delta = self.unsent_delta.clone();
        self.unsent_delta = OperationSeq::default();
        self.unsent_delta
            .retain(self.sent_delta.target_len() as u64);
    }

    async fn on_server_change(&mut self, modif: &ModifRequest) {
        self.rev_num += 1;
        if self.rev_num != modif.rev_num {
            todo!("handle desynchronisation");
        }
        let server_change = &modif.delta;

        let new_server_state = self.server_state.compose(server_change).unwrap();
        let (updated_server_change, new_sent_delta) =
            server_change.transform(&self.sent_delta).unwrap();
        let (ide_delta, new_unsent_delta) =
            updated_server_change.transform(&self.unsent_delta).unwrap();

        self.server_state = new_server_state;
        self.sent_delta = new_sent_delta;
        self.unsent_delta = new_unsent_delta;
        let ide_modifs = to_ide_changes(&ide_delta);
        for modif in ide_modifs {
            let _ = self.ide.send(MessageIde::IDEUpdate(modif)).await;
        }
    }

    pub async fn on_message_server(&mut self, message: MessageServer) {
        match message {
            MessageServer::ServerUpdate(modif) => self.on_server_change(&modif).await,
            MessageServer::Ack => self.on_ack().await,
        }
    }

    pub async fn on_message_ide(&mut self, message_ide: MessageIde) {
        if let MessageIde::IDEUpdate(change) = message_ide {
            let ide_seq = to_operation_seq(&change, &(self.unsent_delta.target_len() as u64));
            self.unsent_delta = self.unsent_delta.compose(&ide_seq).unwrap();
            if self.sent_delta.is_noop() && !self.unsent_delta.is_noop() {
                self.submit_change().await;
            }
        }
    }
}
