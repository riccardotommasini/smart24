use smartshare::protocol::msg::MessageServer;
use tokio::sync::mpsc;

#[derive(Clone)]
pub struct Client {
    id: usize,
    sender: mpsc::Sender<MessageServer>,
}

impl Client {
    pub fn new(id: usize, sender: mpsc::Sender<MessageServer>) -> Self {
        Self { id, sender }
    }

    pub async fn send(&self, message: MessageServer) -> anyhow::Result<()> {
        self.sender.send(message).await.map_err(Into::into)
    }

    pub fn id(&self) -> usize {
        self.id
    }
}
