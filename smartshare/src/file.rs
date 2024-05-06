use std::fmt::Display;

use anyhow::ensure;
use operational_transform::{Operation, OperationSeq};
use ropey::Rope;
use tracing::Instrument;

use crate::protocol::msg::{CursorsInfo, TextModification};

#[derive(Clone)]
pub struct File {
    content: Rope,
}

impl File {
    pub fn new(content: &str) -> Self {
        Self {
            content: Rope::from_str(content),
        }
    }

    pub fn apply(&mut self, seq: &OperationSeq) -> anyhow::Result<()> {
        ensure!(
            seq.base_len() == self.content.len_chars(),
            "Operation base len does not match file len"
        );

        let mut pos = 0;
        for op in seq.ops() {
            match op {
                Operation::Retain(chars) => pos += *chars as usize,
                Operation::Delete(size) => {
                    self.content.remove(pos..pos + (*size as usize));
                }
                Operation::Insert(str) => {
                    self.content.insert(pos, str);
                    pos += str.chars().count();
                }
            }
        }

        debug_assert_eq!(pos, seq.target_len());
        debug_assert_eq!(self.content.len_chars(), seq.target_len());

        Ok(())
    }

    pub fn len_chars(&self) -> usize {
        self.content.len_chars()
    }

    pub fn byte_to_char_modif(&self, modif: &mut TextModification) {
        modif.delete = self
            .content
            .byte_slice(modif.offset as usize..modif.offset as usize + modif.delete as usize)
            .len_chars() as u64;

        modif.offset = self.content.byte_slice(..modif.offset as usize).len_chars() as u64;
    }

    pub fn char_to_byte_modif(&self, modif: &mut TextModification) {
        modif.delete = self
            .content
            .slice(modif.offset as usize..modif.offset as usize + modif.delete as usize)
            .len_bytes() as u64;
        modif.offset = self.content.slice(..modif.offset as usize).len_bytes() as u64;
    }

    pub fn byte_to_char_cursor(&self, cursor_info: &mut CursorsInfo) {
        for cursor in cursor_info.cursors.iter_mut() {
            cursor.cursor = self
                .content
                .byte_slice(..cursor.cursor as usize)
                .len_chars() as u64;
            cursor.anchor = self
                .content
                .byte_slice(..cursor.anchor as usize)
                .len_chars() as u64;
        }
    }

    pub fn char_to_byte_cursor(&self, cursor_info: &mut CursorsInfo) {
        for cursor in cursor_info.cursors.iter_mut() {
            cursor.cursor = self.content.slice(..cursor.cursor as usize).len_bytes() as u64;
            cursor.anchor = self.content.slice(..cursor.anchor as usize).len_bytes() as u64;
        }
    }
}

impl Display for File {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        for chunk in self.content.chunks() {
            f.write_str(chunk)?;
        }

        Ok(())
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use operational_transform::OperationSeq;

    #[test]
    fn apply_retain() {
        let mut file = File::new("Hello world");
        let mut ops = OperationSeq::default();
        ops.retain(11);

        let res = file.apply(&ops);

        assert!(res.is_ok());

        assert_eq!(&file.to_string(), "Hello world");
    }

    #[test]
    fn apply_delete() {
        let mut file = File::new("Hello world");
        let mut ops = OperationSeq::default();
        ops.retain(5);
        ops.delete(6);

        let res = file.apply(&ops);

        assert!(res.is_ok());

        assert_eq!(&file.to_string(), "Hello");
    }

    #[test]
    fn apply_insert() {
        let mut file = File::new("");
        let mut ops = OperationSeq::default();
        ops.insert("Hello world");

        let res = file.apply(&ops);

        assert!(res.is_ok());

        assert_eq!(&file.to_string(), "Hello world");
    }

    #[test]
    fn apply_all() {
        let mut file = File::new("Hello world");
        let mut ops = OperationSeq::default();
        ops.retain(6);
        ops.insert("Smart");
        ops.delete(5);

        let res = file.apply(&ops);

        assert!(res.is_ok());

        assert_eq!(&file.to_string(), "Hello Smart");
    }

    #[test]
    fn apply_len_mismatch() {
        let mut file = File::new("Hello world");
        let mut ops = OperationSeq::default();
        ops.insert("Smart");
        ops.delete(5);

        let res = file.apply(&ops);

        assert!(res.is_err());

        assert_eq!(&file.to_string(), "Hello world");
    }
}
