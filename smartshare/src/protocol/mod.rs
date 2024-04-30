use futures::{Sink, Stream};
use serde::{Deserialize, Serialize};
use tokio::io::{AsyncRead, AsyncWrite};
use tokio_serde::formats::SymmetricalJson;
use tokio_util::codec::{FramedRead, FramedWrite};

use self::codec::LineSeparatedCodec;

pub mod codec;
pub mod msg;

pub fn message_stream<M, R>(read: R) -> impl Stream<Item = anyhow::Result<M>>
where
    R: AsyncRead,
    M: for<'a> Deserialize<'a>
{
    let framed = FramedRead::new(read, LineSeparatedCodec::default());
    tokio_serde::SymmetricallyFramed::<_, M, _>::new(
        framed,
        SymmetricalJson::<M>::default(),
    )
}

pub fn message_sink<M, R>(write: R) -> impl Sink<M, Error = anyhow::Error>
where
    R: AsyncWrite,
    M: Serialize,
{
    let framed = FramedWrite::new(write, LineSeparatedCodec::default());
    tokio_serde::SymmetricallyFramed::<_, M, _>::new(
        framed,
        SymmetricalJson::<M>::default(),
    )
}
