use std::usize;

use operational_transform::{Operation, OperationSeq};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageServer {
    ServerUpdate(ModifRequest),
    Ack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageIde {
    IDEUpdate(TextModification),
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
#[serde(tag = "update_type", rename_all = "snake_case")]
pub struct TextModification {
    pub offset: u64,
    pub delete: u64,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "modifrequest", rename_all = "snake_case")]
pub struct ModifRequest {
    pub delta: OperationSeq,
    pub rev_num: usize,
}

pub fn to_operation_seq(modif: &TextModification, src_length: &u64) -> OperationSeq {
    let mut seq = OperationSeq::default();
    seq.retain(modif.offset);
    seq.delete(modif.delete);
    seq.insert(modif.text.as_str());
    seq.retain(src_length - modif.offset - modif.delete);
    seq
}

#[derive(Debug)]
enum State {
    Ret,
    Ins,
    Del,
}

pub fn to_ide_changes(delta: &OperationSeq) -> Vec<TextModification> {
    let mut modifs: Vec<TextModification> = vec![];
    let mut modif = TextModification::default();
    let mut state = State::Ret;
    for op in delta.clone().ops() {
        println!("state : {:?}; op : {:?}", state, op);
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
