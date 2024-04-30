use smartshare::protocol::msg::MessageServer;
use tokio::sync::mpsc;

#[derive(Clone)]
pub struct Server {
    sender: mpsc::Sender<MessageServer>,
}

impl Server {
    pub fn new(sender: mpsc::Sender<MessageServer>) -> Self {
        Self { sender }
    }

    pub async fn send(&self, message: MessageServer) -> anyhow::Result<()> {
        self.sender.send(message).await.map_err(Into::into)
    }
}
