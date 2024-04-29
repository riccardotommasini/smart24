use core::panic;
use std::env;

use futures::{try_join, SinkExt};
use smartshare::protocol::{message_sink, message_stream};
use tokio::net::TcpStream;

#[tokio::main]
async fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() != 2 {
        panic!("Usage : {} ip:port", args[0]);
    }

    let mut stdin_stream = message_stream(tokio::io::stdin());
    let mut stdout_sink = message_sink(tokio::io::stdout());
    let mut binding = TcpStream::connect(args[1].clone()).await.unwrap();
    let (rx, tx) = binding.split();
    let mut tcp_stream = message_stream(rx);
    let mut tcp_sink = message_sink(tx);

    // tokio::spawn(async move { stdout_sink.send_all(&mut tcp_stream).await.unwrap() });
    // tcp_sink.send_all(&mut stdin_stream).await.unwrap();
    try_join!(
        stdout_sink.send_all(&mut tcp_stream),
        tcp_sink.send_all(&mut stdin_stream)
    )
    .unwrap();
}
