
use tokio_util::bytes::{BufMut, Bytes, BytesMut};
use tokio_util::codec::{Decoder, Encoder};

#[derive(Debug, Default)]
pub struct LineSeparatedCodec {
    processed: usize,
}

impl Decoder for LineSeparatedCodec {
    type Item = BytesMut;

    type Error = anyhow::Error;

    fn decode(
        &mut self,
        src: &mut tokio_util::bytes::BytesMut,
    ) -> Result<Option<Self::Item>, Self::Error> {
        if src.len() <= self.processed {
            return Ok(None);
        }

        let end_of_line = src[self.processed..].iter().position(|byte| *byte == b'\n');

        match end_of_line {
            None => {
                self.processed = src.len();
                Ok(None)
            },
            Some(index) => {
                let frame_len = self.processed + index + 1;
                self.processed = 0;
                let frame = src.split_to(frame_len);
                Ok(Some(frame))
            }
        }
    }
}

impl Encoder<Bytes> for LineSeparatedCodec {
    type Error = anyhow::Error;

    fn encode(&mut self, src: Bytes, dst: &mut BytesMut) -> Result<(), Self::Error> {
        dst.put(src);
        dst.put_u8(b'\n');
        Ok(())
    }
}
