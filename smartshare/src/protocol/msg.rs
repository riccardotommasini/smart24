use operational_transform::{Operation, OperationSeq};
use serde::{Deserialize, Serialize};
use serde_json::de;

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

pub fn toOperationSeq(modif: &TextModification) -> OperationSeq {
    let mut seq = OperationSeq::default();
    seq.retain(modif.offset);
    seq.delete(modif.delete);
    seq.insert(modif.text.as_str());
    todo!("rajouter un retain jusqu'à la fin du fichier");
    //seq.retain(...);
    seq
}

enum State {
    ret,
    del,
    ins,
}

pub fn toIdeChanges(delta: &OperationSeq) -> Vec<TextModification> {
    let mut modifs: Vec<TextModification> = vec![];
    let mut modif = TextModification::default();
    let mut state = State::ret;
    for op in delta.clone().ops() {
        match state {
            State::ret => match op {
                Operation::Retain(retain) => {
                    modif.offset += retain;
                }
                Operation::Delete(delete) => {
                    state = State::del;
                    modif.delete += delete;
                }
                Operation::Insert(insert) => {
                    state = State::ins;
                    modif.text = format!("{}{}", modif.text, insert);
                }
            },

            State::del => match op {
                Operation::Retain(retain) => {
                    let base_offset = modif.offset + (modif.text.len() as u64);
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain;
                    state = State::ret;
                }
                Operation::Delete(delete) => {
                    modif.delete += delete;
                }
                Operation::Insert(insert) => {
                    state = State::ins;
                    modif.text = format!("{}{}", modif.text, insert);
                }
            },
            State::ins => match op {
                Operation::Retain(retain) => {
                    let base_offset = modif.offset + (modif.text.len() as u64);
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain;
                    state = State::ret;
                }
                Operation::Delete(delete) => {
                    let base_offset = modif.offset + (modif.text.len() as u64);
                    modifs.push(modif);
                    modif = TextModification {
                        offset: base_offset,
                        delete: *delete,
                        text: "".to_owned(),
                    };
                    state = State::del;
                }
                Operation::Insert(insert) => {
                    modif.text = format!("{}{}", modif.text, insert);
                }
            },
        }
    }
    modifs.push(modif);
    modifs
}
