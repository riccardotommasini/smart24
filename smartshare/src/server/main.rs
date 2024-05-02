use futures::SinkExt;
use smartshare::protocol::message_sink;
use smartshare::protocol::message_stream;
use tokio::net::TcpSocket;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;
use tracing::info;
use tracing::instrument::WithSubscriber;
use tracing::level_filters::LevelFilter;
use tracing::trace;
use tracing_subscriber::fmt;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::prelude::*;
use tracing_subscriber::EnvFilter;

use crate::client::Client;
use crate::server::Server;

pub mod client;
pub mod server;

#[tokio::main]
async fn main() {
    let env_filter = EnvFilter::builder()
        .with_default_directive(LevelFilter::INFO.into())
        .from_env_lossy();
    tracing_subscriber::registry()
        .with(fmt::layer().with_writer(std::io::stderr).with_ansi(false))
        .with(env_filter)
        .init();
    info!("Creating socket");
    let socket = TcpSocket::new_v4().unwrap();
    info!("Binding socket");
    socket.set_reuseport(true).unwrap();
    let addr = "0.0.0.0:4903".parse().unwrap();
    socket.bind(addr).unwrap();

    let listener = socket.listen(8).unwrap();
    info!("Listening on {}", addr);

    let (mut server, server_handle) = Server::new();
    tokio::spawn(async move {
        server.run().await;
    });

    let mut id = 0;
    loop {
        let (socket, _peer_addr) = listener.accept().await.unwrap();

        let (tx, rx) = mpsc::channel(8);

        let (read, write) = tokio::io::split(socket);

        let current_id = id;
        id += 1;

        let client = Client::new(current_id, tx);
        server_handle.on_connect(client).await;

        let handle = server_handle.clone();

        tokio::spawn(async move {
            let mut stream = message_stream(read);
            while let Some(Ok(message)) = stream.next().await {
                handle.on_message(current_id, message).await;
            }
            handle.on_disconnect(current_id).await;
        });

        tokio::spawn(async move {
            let mut sink = message_sink(write);
            let mut rx_stream = ReceiverStream::new(rx).map(Ok);
            let _ = sink.send_all(&mut rx_stream).await;
        });
    }
}
