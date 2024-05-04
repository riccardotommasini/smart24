pub mod client;
pub mod ide;
pub mod server;

use core::panic;
use std::env;

use futures::SinkExt;
use smartshare::protocol::msg::{MessageIde, MessageServer};
use smartshare::protocol::{message_sink, message_stream};
use tokio::net::TcpStream;
use tokio::select;
use tokio::sync::mpsc;
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

    let mut client = Client::new(server, ide, 0);

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

#[cfg(test)]
mod test {
    use smartshare::protocol::msg::{MessageIde, MessageServer};

    use crate::client::Client;
    use crate::ide::Ide;
    use crate::server::Server;

    #[tokio::test]
    async fn simple_connection() {
        let (server_sender, _server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        client.on_message_server(MessageServer::File { file: "Hello world".into(), version: 0 }).await;

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::File { file: "Hello world".into() }));
    }

    #[tokio::test]
    async fn first_connection() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        client.on_message_server(MessageServer::RequestFile).await;

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::RequestFile));

        client.on_message_ide(MessageIde::File { file: "Hello world".into() }).await;

        assert_eq!(server_receiver.try_recv(), Ok(MessageServer::File { file: "Hello world".into(), version: 0 }));
    }
}
