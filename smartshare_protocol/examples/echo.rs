use std::sync::atomic::AtomicU32;
use std::time::Duration;

use smartshare_protocol::msg::Message;
use smartshare_protocol::{IntoHandler, SmartShareServer};

async fn handler(message: Message, state: &u32) -> Result<Option<Message>, anyhow::Error> {
    eprintln!("Count: {state}");
    match message {
        Message::TextUpdate(_) => Ok(Some(Message::Ack)),
        Message::Ack => Ok(None),
    }
}

#[tokio::main]
async fn main() {
    let (server, notification_sender) = SmartShareServer::stdio(handler, &0);

    tokio::spawn(async move {
        loop {
            notification_sender.send(Message::Ack).await.unwrap();
            tokio::time::sleep(Duration::from_secs(10)).await;
        }
    });

    server.run().await;
}
