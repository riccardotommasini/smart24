use std::marker::PhantomData;

use std::future::Future;

use futures::{SinkExt, TryStreamExt};
use tokio::io::{AsyncRead, AsyncWrite};
use tokio::sync::mpsc;
use tokio_serde::formats::SymmetricalJson;
use tokio_stream::wrappers::ReceiverStream;
use tokio_stream::StreamExt;
use tokio_util::codec::{FramedRead, FramedWrite};
use tower::Service;

use self::codec::PlainTextLengthCodec;
use self::msg::Message;

pub mod codec;
pub mod msg;

pub struct SmartShareServer<I, O, S> {
    service: S,
    input: I,
    output: O,
    notification_receiver: mpsc::Receiver<Message>,
}


impl<F, State>
    SmartShareServer<
        tokio::io::Stdin,
        tokio::io::Stdout,
        Handler<Message, Option<Message>, State, F>,
    >
{
    pub fn stdio<IS>(service: IS, state: State) -> (Self, mpsc::Sender<Message>)
    where
        IS: IntoHandler<Message, Option<Message>, State, Future = F>,
    {
        let (tx, rx) = mpsc::channel(32);
        (
            Self {
                service: service.into_handler(state),
                input: tokio::io::stdin(),
                output: tokio::io::stdout(),
                notification_receiver: rx,
            },
            tx,
        )
    }
}

impl<I, O, S, F> SmartShareServer<I, O, S>
where
    I: AsyncRead,
    O: AsyncWrite,
    S: Service<Message, Response = Option<Message>, Error = anyhow::Error, Future = F>,
    F: Future<Output = Result<Option<Message>, anyhow::Error>>,
{
    pub async fn run(mut self) {
        let input = self.input;
        tokio::pin!(input);

        let output = self.output;
        tokio::pin!(output);

        let read = FramedRead::new(input, PlainTextLengthCodec::default());
        let write = FramedWrite::new(output, PlainTextLengthCodec::default());

        let deserialized = tokio_serde::SymmetricallyFramed::<_, Message, _>::new(
            read,
            SymmetricalJson::<Message>::default(),
        );

        let mut serialized = tokio_serde::SymmetricallyFramed::<_, Message, _>::new(
            write,
            SymmetricalJson::<Message>::default(),
        );

        let output = deserialized
            .and_then(|message| {
                let future = self.service.call(message);
                Box::pin(future)
            })
            .filter_map(|m| match m {
                Ok(None) => None,
                Ok(Some(m)) => Some(Ok(m)),
                Err(e) => Some(Err(e)),
            })
            .merge(ReceiverStream::new(self.notification_receiver).map(Ok));
        tokio::pin!(output);

        serialized.send_all(&mut output).await.unwrap();
    }
}

pub struct Handler<Req, Res, S, F> {
    #[allow(clippy::type_complexity)]
    inner: Box<dyn Fn(Req, S) -> F>,
    state: S,
    _phantom: PhantomData<fn() -> Res>,
}

pub trait IntoHandler<Req, Res, S> {
    type Future: Future<Output = Result<Res, anyhow::Error>>;
    fn into_handler(self, state: S) -> Handler<Req, Res, S, Self::Future>;
}

impl<Req, Res, F, FN, S> IntoHandler<Req, Res, S> for FN
where
    S: Clone,
    F: Future<Output = Result<Res, anyhow::Error>>,
    FN: Fn(Req, S) -> F + 'static,
{
    type Future = F;

    fn into_handler(self, state: S) -> Handler<Req, Res, S, Self::Future> {
        Handler {
            inner: Box::new(self),
            state,
            _phantom: PhantomData,
        }
    }
}

impl<Req, Res, S, F> Service<Req> for Handler<Req, Res, S, F>
where
    F: Future<Output = Result<Res, anyhow::Error>>,
    S: Clone,
{
    type Response = Res;

    type Error = anyhow::Error;

    type Future = F;

    fn poll_ready(
        &mut self,
        _cx: &mut std::task::Context<'_>,
    ) -> std::task::Poll<Result<(), Self::Error>> {
        std::task::Poll::Ready(Ok(()))
    }

    fn call(&mut self, req: Req) -> Self::Future {
        (self.inner)(req, self.state.clone())
    }
}
