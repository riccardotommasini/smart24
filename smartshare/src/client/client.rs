use operational_transform::{Operation, OperationSeq};
use smartshare::protocol::msg::{
    toIdeChanges, toOperationSeq, MessageIde, MessageServer, ModifRequest,
};

use crate::ide::Ide;
use crate::server::Server;

pub struct Client {
    server_state: OperationSeq,
    sent_delta: OperationSeq,
    unsent_delta: OperationSeq,
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
            server,
            ide,
            client_id,
        }
    }

    async fn on_ack(&mut self) {
        self.server_state = self.server_state.compose(&self.sent_delta).unwrap();
        self.sent_delta = OperationSeq::default();
    }

    async fn submit_change(&mut self) {
        let _ = self.server.send(MessageServer::ServerUpdate(ModifRequest {
            delta: self.unsent_delta.clone(),
            rev_num: self.client_id,
        })).await;
        self.sent_delta = self.unsent_delta.clone();
        self.unsent_delta = OperationSeq::default();
    }

    async fn on_server_change(&mut self, modif: &ModifRequest) {
        let server_change = &modif.delta;

        let new_server_state = self.server_state.compose(server_change).unwrap();
        let (updated_server_change, new_sent_delta) =
            server_change.transform(&self.sent_delta).unwrap();
        let (ide_delta, new_unsent_delta) =
            updated_server_change.transform(&self.unsent_delta).unwrap();

        self.server_state = new_server_state;
        self.sent_delta = new_sent_delta;
        self.unsent_delta = new_unsent_delta;
        let ide_modifs = toIdeChanges(&ide_delta);
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
            self.unsent_delta = self.unsent_delta.compose(&toOperationSeq(&change)).unwrap();
        }
    }
}
