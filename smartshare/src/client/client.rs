use kyte::{Compose, Delta, Transform};
use smartshare::protocol::msg::{toDelta, toIdeChanges, MessageIde, MessageServer, ModifRequest};

use crate::ide::Ide;
use crate::server::Server;

pub struct Client {
    server_state: Delta<String, ()>,
    sent_delta: Delta<String, ()>,
    unsent_delta: Delta<String, ()>,
    server: Server,
    ide: Ide,
}

impl Client {
    pub fn new(server: Server, ide: Ide) -> Self {
        Self {
            server_state: Delta::new(),
            sent_delta: Delta::new(),
            unsent_delta: Delta::new(),
            server,
            ide,
        }
    }

    async fn on_ack(&mut self) {
        self.server_state = self.server_state.clone().compose(self.sent_delta.clone());
        self.sent_delta = Delta::new();
    }

    async fn submit_change(&mut self) {
        todo!("send the new 'unsent_delta' to the server");
        self.sent_delta = self.unsent_delta;
        self.unsent_delta = Delta::new();
    }

    async fn on_server_change(&mut self, modif: &ModifRequest) {
        let server_change = &modif.delta;
        self.server_state = self.server_state.clone().compose(server_change.clone());
        self.unsent_delta = self
            .sent_delta
            .clone()
            .transform(server_change.clone(), true)
            .transform(self.unsent_delta.clone(), true);
        let ide_delta = self.unsent_delta.clone().transform(
            self.sent_delta
                .clone()
                .transform(server_change.clone(), false),
            false,
        );
        self.sent_delta = server_change
            .clone()
            .transform(self.sent_delta.clone(), false);
        let ide_modifs = toIdeChanges(&ide_delta);
        for modif in ide_modifs {
            self.ide.send(MessageIde::IDEUpdate(modif));
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
            self.unsent_delta = self.unsent_delta.clone().compose(toDelta(&change));
        }
    }
}

