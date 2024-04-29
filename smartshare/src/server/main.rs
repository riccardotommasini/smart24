use std::sync::Arc;

use futures::SinkExt;
use smartshare::protocol::message_sink;
use smartshare::protocol::message_stream;
use smartshare::protocol::msg::Message;
use std::sync::Mutex;
use tokio::net::TcpSocket;
use tokio::sync::mpsc;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;

use crate::client::Client;

pub mod client;

#[tokio::main]
async fn main() {
    println!("Hello from server");
    let socket = TcpSocket::new_v4().unwrap();
    socket.bind("0.0.0.0:4903".parse().unwrap()).unwrap();
    let listener = socket.listen(8).unwrap();

    let (message_sender, mut message_receiver) = mpsc::channel::<(usize, Message)>(8);

    let clients = Arc::new(Mutex::new(Vec::<Client>::new()));

    let clients_clone = clients.clone();
    tokio::spawn(async move {
        let clients = clients_clone;
        while let Some((id, message)) = message_receiver.recv().await {
            let clients = clients.lock().unwrap().clone();
            for client in clients.iter().filter(|client| client.id() != id) {
                let _ = client.send(message.clone()).await;
            }
        }
    });

    loop {
        let mut id = 0;
        let (socket, _peer_addr) = listener.accept().await.unwrap();

        let (tx, rx) = mpsc::channel(8);

        let (read, write) = tokio::io::split(socket);

        let current_id = id;
        id += 1;

        let client = Client::new(current_id, tx);

        clients.lock().unwrap().push(client);

        let sender = message_sender.clone();
        tokio::spawn(async move {
            let mut stream = message_stream(read);
            while let Some(Ok(message)) = stream.next().await {
                let _ = sender.send((id, message)).await;
            }
        });

        tokio::spawn(async move {
            let mut sink = message_sink(write);
            let mut rx_stream = ReceiverStream::new(rx).map(Ok);
            let _ = sink.send_all(&mut rx_stream).await;
        });
    }
}
