use serde::{Deserialize, Serialize};


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "action", rename_all = "snake_case")]
pub enum Message {
    TextUpdate(TextModification),
    Ack,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "update_type", rename_all = "snake_case")]
pub enum TextModification {
    Insert {line: usize, col: usize, text: Vec<String>},
    Delete {start_line: usize, start_col: usize, end_line: usize, end_col: usize},
}
