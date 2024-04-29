use serde::{Deserialize, Serialize};
use kyte::Delta;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum Message {
    IDEUpdate(TextModification),
    ServerUpdate(Delta<String, ()>),
    Ack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "update_type", rename_all = "snake_case")]
pub struct TextModification {
    pub offset : usize,
    pub delete : usize,
    pub text : String,
}
