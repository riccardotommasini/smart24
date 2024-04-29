
use std::fmt::Write;

use anyhow::ensure;
use tokio_util::bytes::{Buf, BufMut, Bytes, BytesMut};
use tokio_util::codec::{Decoder, Encoder};

#[derive(Debug, Default)]
enum DecoderState {
    #[default]
    Head,
    Data(usize),
}
#[derive(Debug, Default)]
pub struct PlainTextLengthCodec {
    state: DecoderState,
}

impl PlainTextLengthCodec {
    pub fn decode_head(&self, src: &mut BytesMut) -> anyhow::Result<Option<usize>> {
        let Some(line_begin) = src.iter().position(|byte| !byte.is_ascii_whitespace()) else {
            return Ok(None);
        };

        src.advance(line_begin);

        let end_of_line = src.iter().position(|byte| *byte == b'\n');
        match end_of_line {
            None => Ok(None),
            Some(index) => {
                ensure!(&src[..index].iter().all(u8::is_ascii_digit), "Length line must only contain digits");

                let n: usize = std::str::from_utf8(&src[..index])?.parse()?;
                src.advance(index + 1);
                src.reserve((n + 1).saturating_sub(src.len()));
                Ok(Some(n))
            }
        }
    }

    pub fn decode_data(&self, n: usize, src: &mut BytesMut) -> anyhow::Result<Option<BytesMut>> {
        if src.len() < n + 1 {
            return Ok(None);
        }

        let payload = src.split_to(n);

        Ok(Some(payload))
    } 
}

impl Decoder for PlainTextLengthCodec {
    type Item = BytesMut;

    type Error = anyhow::Error;

    fn decode(
        &mut self,
        src: &mut tokio_util::bytes::BytesMut,
    ) -> Result<Option<Self::Item>, Self::Error> {
        let n = match self.state {
            DecoderState::Head => match self.decode_head(src)? {
                Some(n) => {
                    self.state = DecoderState::Data(n);
                    n
                },
                None => return Ok(None),
            }
            DecoderState::Data(n) => n
        };

        match self.decode_data(n, src)? {
            Some(payload) => {
                src.reserve(32usize.saturating_sub(src.len()));
                self.state = DecoderState::Head;
                Ok(Some(payload))
            },
            None => Ok(None),
        }
    }
}

impl Encoder<Bytes> for PlainTextLengthCodec {
    type Error = anyhow::Error;

    fn encode(&mut self, src: Bytes, dst: &mut BytesMut) -> Result<(), Self::Error> {
        let len = src.len();
        dst.write_fmt(format_args!("{}\n", len)).unwrap();
        dst.put(src);
        dst.put_u8(b'\n');

        Ok(())
    }
}
