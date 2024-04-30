use smartshare::protocol::msg::MessageIde;
use tokio::sync::mpsc;

#[derive(Clone)]
pub struct Ide {
    sender: mpsc::Sender<MessageIde>,
}

impl Ide {
    pub fn new(sender: mpsc::Sender<MessageIde>) -> Self {
        Self { sender }
    }

    pub async fn send(&self, message: MessageIde) -> anyhow::Result<()> {
        self.sender.send(message).await.map_err(Into::into)
    }
}
