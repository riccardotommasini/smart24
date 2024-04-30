pub mod client;
pub mod ide;
pub mod server;

use core::panic;
use std::env;

use futures::{try_join, SinkExt};
use smartshare::protocol::msg::{MessageIde, MessageServer};
use smartshare::protocol::{message_sink, message_stream};
use tokio::select;
use tokio::sync::mpsc;
use tokio::{net::TcpStream, stream};
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;
use tracing::{error, info};

use self::client::Client;
use self::ide::Ide;
use self::server::Server;

#[tokio::main]
async fn main() {
    let subscriber = tracing_subscriber::fmt()
        .with_writer(std::io::stderr)
        .with_ansi(false)
        .finish();
    tracing::subscriber::set_global_default(subscriber).unwrap();

    let mut binding: TcpStream;
    if let Some(x) = env::args().nth(1) {
        match TcpStream::connect(x).await {
            Ok(stream) => {
                binding = stream;
            }
            Err(err) => {
                error!("{err}");
                panic!("{err}");
            }
        };
        info!("Successfully connected to server");
    } else {
        let prog = env::args().next().unwrap();
        panic!("Usage : {prog} ip:port");
    }
    let (rx, tx) = tokio::io::split(binding);

    let (ide_sender, ide_receiver) = mpsc::channel(8);
    let ide = Ide::new(ide_sender);

    let (server_sender, server_receiver) = mpsc::channel(8);
    let server = Server::new(server_sender);

    let mut client = Client::new(server, ide);

    tokio::spawn(async move {
        let mut stdout_sink = message_sink::<MessageIde, _>(tokio::io::stdout());
        let mut stream = ReceiverStream::new(ide_receiver).map(Ok);
        stdout_sink.send_all(&mut stream).await.unwrap();
    });

    tokio::spawn(async move {
        let mut tcp_sink = message_sink::<MessageServer, _>(tx);
        let mut stream = ReceiverStream::new(server_receiver).map(Ok);
        tcp_sink.send_all(&mut stream).await.unwrap();
    });

    let mut stdin_stream = message_stream::<MessageIde, _>(tokio::io::stdin());
    let mut tcp_stream = message_stream::<MessageServer, _>(rx);

    loop {
        select! {
            message_opt = stdin_stream.next() => {
                match message_opt {
                    Some(Ok(message)) => {
                        client.on_message_ide(message).await;
                    },
                    Some(Err(err)) => {
                        error!("Error while reading stdin: {}", err);
                        break;
                    },
                    None => {
                        error!("End of stdin stream");
                        break;
                    },
                }
            }
            message_opt = tcp_stream.next() => {
                match message_opt {
                    Some(Ok(message)) => {
                        client.on_message_server(message).await;
                    },
                    Some(Err(err)) => {
                        error!("Error while reading tcp_stream: {}", err);
                        break;
                    },
                    None => {
                        error!("End of tcp stream");
                        break;
                    },
                }
            }
        }
    }
}
