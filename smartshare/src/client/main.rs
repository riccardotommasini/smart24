use core::panic;
use std::env;

use futures::{try_join, SinkExt};
use smartshare::protocol::{message_sink, message_stream};
use tokio::{net::TcpStream, stream};
use tracing::{error, info};

#[tokio::main]
async fn main() {
    let subscriber = tracing_subscriber::fmt()
        .with_writer(std::io::stderr)
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
    let (rx, tx) = binding.split();

    let mut stdin_stream = message_stream(tokio::io::stdin());
    let mut stdout_sink = message_sink(tokio::io::stdout());
    let mut tcp_stream = message_stream(rx);
    let mut tcp_sink = message_sink(tx);

    if let Err(err) = try_join!(
        stdout_sink.send_all(&mut tcp_stream),
        tcp_sink.send_all(&mut stdin_stream)
    ) {
        error!("{err}");
        panic!("{err}");
    }
}
