pub struct Client {
    server_state : Delta<String, ()>,
    sent_delta : Delta<String, ()>,
    unsent_delta : Delta<String, ()>,
}

impl Client {
    pub fn new() -> Self {
        Self {
            server_state: Delta::new(),
            sent_delta: Delta::new(),
            unsent_delta: Delta::new(),
        }
    }

    async fn on_ack(&mut self) {
        self.server_state = self.server_state.clone().compose(sent_delta);
        self.sent_delta = Delta::new();
    }

    async fn submit_change(&mut self) {
        todo!("send the new 'unsent_delta' to the server");
        self.sent_delta = self.unsent_delta;
        self.unsent_delta = Delta::new();
    }

    async fn on_server_change(&mut self, server_change : &Delta<String, ()>) {
        self.server_state = self.server_state.clone().compose(server_change.clone());
        self.unsent_delta = self.sent_delta.clone().transform(server_change.clone()).transform(self.unsent_delta.clone());
        let ide_delta = self.unsent_delta.clone().transform(self.sent_delta.clone().transform(server_change.clone()));
        self.sent_delta = server_change.clone().transform(self.sent_delta.clone());
        todo!("send 'ide_delta' to the ide");
    }

    async fn on_message_ide(&mut self, message_ide : MessageIde) {
        if let MessageIde::IDEUpdate(change) = message_ide {
            self.unsent_delta = self.unsent_delta.clone().compose(toDelta(change));
        }
    }
}