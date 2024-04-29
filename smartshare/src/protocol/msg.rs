use serde::{Deserialize, Serialize};
use kyte::Delta;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageServer {
    ServerUpdate(ModifRequest),
    Ack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum MessageIde {
    IDEUpdate(TextModification)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "update_type", rename_all = "snake_case")]
pub struct TextModification {
    pub offset : usize,
    pub delete : usize,
    pub text : String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "modifrequest", rename_all = "snake_case")]
pub struct ModifRequest {
    pub delta : Delta<String, ()>,
    pub rev_num : usize,
}

pub fn toDelta(modif: &TextModification) -> Delta<String, ()> {
    Delta::new().retain(modif.offset, ()).delete(modif.delete).insert(modif.text.to_owned(), ())
}
