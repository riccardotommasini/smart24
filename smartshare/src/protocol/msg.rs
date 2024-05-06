use std::usize;

use operational_transform::{Operation, OperationSeq};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageServer {
    ServerUpdate(ModifRequest),
    Ack,
    Error { error: String },
    RequestFile,
    File { file: String, version: usize },
    Cursor { id: usize, offset: u64, range: u64 },
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageIde {
    Update { changes: Vec<TextModification> },
    Declare(Format),
    Error { error: String },
    RequestFile,
    File { file: String },
    Ack,
    Cursor { id: usize, offset: u64, range: u64 },
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct TextModification {
    pub offset: u64,
    pub delete: u64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct ModifRequest {
    pub delta: OperationSeq,
    pub rev_num: usize,
}

pub fn modifs_to_operation_seq(
    modifs: &Vec<TextModification>,
    src_length: &u64,
) -> Result<OperationSeq, anyhow::Error> {
    let mut op_seq = match modifs.get(0) {
        Some(modif) => modif_to_operation_seq(modif, src_length)?,
        None => {
            let mut noop = OperationSeq::default();
            noop.retain(*src_length);
            return Ok(noop);
        }
    };
    for modif in &modifs[1..] {
        op_seq = op_seq
            .compose(&modif_to_operation_seq(
                modif,
                &(op_seq.target_len() as u64),
            )?)
            .expect("modif_to_operation_seq result should be length compatible with op_seq");
    }
    Ok(op_seq)
}

pub fn modif_to_operation_seq(
    modif: &TextModification,
    src_length: &u64,
) -> Result<OperationSeq, anyhow::Error> {
    let rem_length = src_length
        .checked_sub(modif.offset + modif.delete)
        .ok_or(anyhow::anyhow!("invalid offset and/or delete"))?;
    let mut seq = OperationSeq::default();
    seq.retain(modif.offset);
    seq.delete(modif.delete);
    seq.insert(modif.text.as_str());
    seq.retain(rem_length);
    Ok(seq)
}

#[derive(Debug)]
enum State {
    Ret,
    Ins,
    Del,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(tag = "offset_format", rename_all = "snake_case")]
pub enum Format {
    Bytes,
    Chars,
}

pub fn to_ide_changes(delta: &OperationSeq) -> Vec<TextModification> {
    let mut modifs: Vec<TextModification> = vec![];
    let mut modif = TextModification::default();
    let mut state = State::Ret;
    for op in delta.clone().ops() {
        match state {
            State::Ret => match op {
                Operation::Retain(retain) => {
                    modif.offset += retain;
                }
                Operation::Insert(insert) => {
                    state = State::Ins;
                    modif.text = format!("{}{}", modif.text, insert);
                }
                Operation::Delete(delete) => {
                    state = State::Del;
                    modif.delete += delete;
                }
            },
            State::Ins => match op {
                Operation::Retain(retain) => {
                    let base_offset = modif.offset + (modif.text.chars().count() as u64);
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain;
                    state = State::Ret;
                }
                Operation::Insert(insert) => {
                    modif.text = format!("{}{}", modif.text, insert);
                }
                Operation::Delete(delete) => {
                    modif.delete += delete;
                    state = State::Del;
                }
            },
            State::Del => match op {
                Operation::Retain(retain) => {
                    let base_offset = modif.offset + (modif.text.chars().count() as u64);
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain;
                    state = State::Ret;
                }
                Operation::Delete(delete) => {
                    modif.delete += delete;
                }
                Operation::Insert(insert) => {
                    let base_offset = modif.offset + (modif.text.chars().count() as u64);
                    modifs.push(modif);
                    modif = TextModification {
                        offset: base_offset,
                        delete: 0,
                        text: insert.clone(),
                    };
                    state = State::Ins;
                }
            },
        }
    }
    if modif.delete != 0 || !modif.text.is_empty() {
        modifs.push(modif);
    }
    modifs
}
