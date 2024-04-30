use kyte::{Delta, Op};
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
    pub offset: usize,
    pub delete: usize,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "modifrequest", rename_all = "snake_case")]
pub struct ModifRequest {
    pub delta: Delta<String, ()>,
    pub rev_num: usize,
}

pub fn toDelta(modif: &TextModification) -> Delta<String, ()> {
    Delta::new()
        .retain(modif.offset, ())
        .delete(modif.delete)
        .insert(modif.text.to_owned(), ())
}

enum State {
    ret,
    del,
    ins,
}

pub fn toIdeChanges(delta: &Delta<String, ()>) -> Vec<TextModification> {
    let mut modifs: Vec<TextModification> = vec![];
    let mut modif = TextModification::default();
    let mut state = State::ret;
    for op in delta.clone().into_iter() {
        match state {
            State::ret => match op {
                Op::Retain(retain) => {
                    modif.offset += retain.retain;
                }
                Op::Delete(delete) => {
                    state = State::del;
                    modif.delete += delete.delete;
                }
                Op::Insert(insert) => {
                    state = State::ins;
                    modif.text = format!("{}{}", modif.text, insert.insert);
                }
            },

            State::del => match op {
                Op::Retain(retain) => {
                    let base_offset = modif.offset + modif.text.len();
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain.retain;
                    state = State::ret;
                }
                Op::Delete(delete) => {
                    modif.delete += delete.delete;
                }
                Op::Insert(insert) => {
                    state = State::ins;
                    modif.text = format!("{}{}", modif.text, insert.insert);
                }
            },
            State::ins => match op {
                Op::Retain(retain) => {
                    let base_offset = modif.offset + modif.text.len();
                    modifs.push(modif);
                    modif = TextModification::default();
                    modif.offset = base_offset + retain.retain;
                    state = State::ret;
                }
                Op::Delete(delete) => {
                    let base_offset = modif.offset + modif.text.len();
                    modifs.push(modif);
                    modif = TextModification {
                        offset: base_offset,
                        delete: delete.delete,
                        text: "".to_owned(),
                    };
                    state = State::del;
                }
                Op::Insert(insert) => {
                    modif.text = format!("{}{}", modif.text, insert.insert);
                }
            },
        }
    }
    modifs.push(modif);
    modifs
}
