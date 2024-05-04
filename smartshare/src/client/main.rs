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
    use operational_transform::OperationSeq;
    use smartshare::protocol::msg::{
        Format, MessageIde, MessageServer, ModifRequest, TextModification,
    };

    use crate::client::Client;
    use crate::ide::Ide;
    use crate::server::Server;

    #[tokio::test]
    async fn simple_connection() {
        let (server_sender, _server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        client
            .on_message_server(MessageServer::File {
                file: "Hello world".into(),
                version: 0,
            })
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::File {
                file: "Hello world".into()
            })
        );
    }

    #[tokio::test]
    async fn first_connection() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        client.on_message_server(MessageServer::RequestFile).await;

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::RequestFile));

        client
            .on_message_ide(MessageIde::File {
                file: "Hello world".into(),
            })
            .await;

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::File {
                file: "Hello world".into(),
                version: 0
            })
        );
    }

    #[tokio::test]
    async fn ide_change() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        // simple connexion with format decl

        client
            .on_message_server(MessageServer::File {
                file: "hello world".into(),
                version: 4,
            })
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::File {
                file: "hello world".into()
            })
        );

        client
            .on_message_ide(MessageIde::Declare(Format::Chars))
            .await;

        // ide change

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![
                    TextModification {
                        offset: 0,
                        delete: 1,
                        text: "H".into(),
                    },
                    TextModification {
                        offset: 6,
                        delete: 1,
                        text: "W".into(),
                    },
                ],
            })
            .await;

        let mut server_modif = OperationSeq::default();
        server_modif.insert("H");
        server_modif.delete(1);
        server_modif.retain(5);
        server_modif.insert("W");
        server_modif.delete(1);
        server_modif.retain(4);

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 4
            }))
        );

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));
    }

    #[tokio::test]
    async fn ide_conflict() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        // simple connexion with format decl

        client
            .on_message_server(MessageServer::File {
                file: "Hello world".into(),
                version: 4,
            })
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::File {
                file: "Hello world".into()
            })
        );

        client
            .on_message_ide(MessageIde::Declare(Format::Chars))
            .await;

        // server change

        let mut server_modif = OperationSeq::default();
        server_modif.retain(11);
        server_modif.insert("!");

        client
            .on_message_server(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 5,
            }))
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 11,
                    delete: 0,
                    text: "!".into(),
                }]
            })
        );

        // ide change without ack before

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 5,
                    delete: 0,
                    text: " new".into(),
                }],
            })
            .await;

        let mut server_modif = OperationSeq::default();
        server_modif.retain(5);
        server_modif.insert(" new");
        server_modif.retain(7);

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 5
            }))
        );

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 15,
                    delete: 0,
                    text: "!".into(),
                }]
            })
        );
    }

    #[tokio::test]
    async fn server_conflict() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        // simple connexion with format decl

        client
            .on_message_server(MessageServer::File {
                file: "Hello world".into(),
                version: 42,
            })
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::File {
                file: "Hello world".into()
            })
        );

        client
            .on_message_ide(MessageIde::Declare(Format::Chars))
            .await;

        // ide change

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 5,
                    delete: 0,
                    text: " new".into(),
                }],
            })
            .await;

        let mut server_modif = OperationSeq::default();
        server_modif.retain(5);
        server_modif.insert(" new");
        server_modif.retain(6);

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 42
            }))
        );

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));

        // server change without ack

        let mut server_modif = OperationSeq::default();
        server_modif.retain(11);
        server_modif.insert("!");

        client
            .on_message_server(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 43,
            }))
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 15,
                    delete: 0,
                    text: "!".into(),
                }]
            })
        );
    }

    #[tokio::test]
    async fn multilple_conflicts() {
        let (server_sender, mut server_receiver) = tokio::sync::mpsc::channel(8);
        let (ide_sender, mut ide_receiver) = tokio::sync::mpsc::channel(8);
        let mut client = Client::new(Server::new(server_sender), Ide::new(ide_sender), 0);

        // simple connexion with format decl

        client
            .on_message_server(MessageServer::File {
                file: "Hello world".into(),
                version: 42,
            })
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::File {
                file: "Hello world".into()
            })
        );

        client
            .on_message_ide(MessageIde::Declare(Format::Chars))
            .await;

        // ide change

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 5,
                    delete: 0,
                    text: " new".into(),
                }],
            })
            .await;

        let mut server_modif = OperationSeq::default();
        server_modif.retain(5);
        server_modif.insert(" new");
        server_modif.retain(6);

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 42
            }))
        );

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));

        // server change without ack

        let mut server_modif = OperationSeq::default();
        server_modif.retain(11);
        server_modif.insert("!");

        client
            .on_message_server(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 43,
            }))
            .await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 15,
                    delete: 0,
                    text: "!".into(),
                }]
            })
        );

        // ide change without ack

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![
                    TextModification {
                        offset: 6,
                        delete: 1,
                        text: "N".into(),
                    },
                    TextModification {
                        offset: 10,
                        delete: 1,
                        text: "W".into(),
                    },
                ],
            })
            .await;

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 15,
                    delete: 0,
                    text: "!".into(),
                }]
            })
        );

        // server change without ack before

        let mut server_modif = OperationSeq::default();
        server_modif.retain(12);
        server_modif.insert(" :)");

        client
            .on_message_server(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 44,
            }))
            .await;

        // ide change without ack before

        client
            .on_message_ide(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 9,
                    delete: 0,
                    text: "er".into(),
                }],
            })
            .await;

        assert_eq!(ide_receiver.try_recv(), Ok(MessageIde::Ack));

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 17,
                    delete: 0,
                    text: "! :)".into(),
                }]
            })
        );

        // server ack

        client.on_message_server(MessageServer::Ack).await;

        let mut server_modif = OperationSeq::default();
        server_modif.retain(6);
        server_modif.delete(1);
        server_modif.insert("N");
        server_modif.retain(2);
        server_modif.insert("er");
        server_modif.retain(1);
        server_modif.delete(1);
        server_modif.insert("W");
        server_modif.retain(8);

        assert_eq!(
            server_receiver.try_recv(),
            Ok(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 45
            }))
        );

        // server change without ack

        let mut server_modif = OperationSeq::default();
        server_modif.insert("#");
        server_modif.retain(19);

        client
            .on_message_server(MessageServer::ServerUpdate(ModifRequest {
                delta: server_modif,
                rev_num: 46,
            }))
            .await;

        // ide ack

        client.on_message_ide(MessageIde::Ack).await;

        assert_eq!(
            ide_receiver.try_recv(),
            Ok(MessageIde::Update {
                changes: vec![TextModification {
                    offset: 0,
                    delete: 0,
                    text: "#".into(),
                }]
            })
        );
    }
}
