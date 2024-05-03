use operational_transform::OperationSeq;
use smartshare::{
    file::File,
    protocol::msg::{
        modifs_to_operation_seq, to_ide_changes, Format, MessageIde, MessageServer, ModifRequest,
        TextModification,
    },
};

use crate::ide::Ide;
use crate::server::Server;
use tracing::{info, warn};

pub struct Client {
    server_state: OperationSeq,
    server_sent_delta: OperationSeq,
    server_unsent_delta: OperationSeq,
    ide_state: OperationSeq,
    ide_sent_delta: OperationSeq,
    ide_unsent_delta: OperationSeq,
    rev_num: usize,
    server: Server,
    ide: Ide,
    client_id: usize,
    format: Option<Format>,
    file: Option<File>,
    ide_ack: bool,
}

impl Client {
    pub fn new(server: Server, ide: Ide, client_id: usize) -> Self {
        Self {
            server_state: OperationSeq::default(),
            server_sent_delta: OperationSeq::default(),
            server_unsent_delta: OperationSeq::default(),
            ide_state: OperationSeq::default(),
            ide_sent_delta: OperationSeq::default(),
            ide_unsent_delta: OperationSeq::default(),
            rev_num: 0,
            server,
            ide,
            client_id,
            format: None,
            file: None,
            ide_ack: true,
        }
    }

    async fn on_ack(&mut self) {
        self.rev_num += 1;
        self.server_state = self.server_state.compose(&self.server_sent_delta).unwrap();
        self.server_sent_delta = OperationSeq::default();
        self.server_sent_delta
            .retain(self.server_state.target_len() as u64);
        if !self.server_unsent_delta.is_noop() {
            self.submit_server_change().await;
        }
    }

    async fn submit_server_change(&mut self) {
        let _ = self
            .server
            .send(MessageServer::ServerUpdate(ModifRequest {
                delta: self.server_unsent_delta.clone(),
                rev_num: self.rev_num,
            }))
            .await;
        self.server_sent_delta = self.server_unsent_delta.clone();
        self.server_unsent_delta = OperationSeq::default();
        self.server_unsent_delta
            .retain(self.server_sent_delta.target_len() as u64);
    }

    async fn on_server_error(&mut self, err: String) {
        self.ide.send(MessageIde::Error { error: err }).await;
    }

    async fn on_server_change(&mut self, modif: &ModifRequest) {
        if self.format.is_none() {
            let _ = self
                .ide
                .send(MessageIde::Error {
                    error: "Error: Offset format was not set by IDE".into(),
                })
                .await;
            return;
        }

        if self.file.is_none() {
            let _ = self
                .ide
                .send(MessageIde::Error {
                    error: "Error: Unknown file".into(),
                })
                .await;
            return;
        }

        self.rev_num += 1;
        if self.rev_num != modif.rev_num {
            todo!("handle desynchronisation");
        }
        let server_change = &modif.delta;

        let new_server_state = self.server_state.compose(server_change).unwrap();
        let (updated_server_change, new_server_sent_delta) =
            server_change.transform(&self.server_sent_delta).unwrap();
        let (ide_delta, new_server_unsent_delta) = updated_server_change
            .transform(&self.server_unsent_delta)
            .unwrap();

        self.server_state = new_server_state;

        let mut ide_modifs = to_ide_changes(&ide_delta);

        if matches!(self.format.as_ref().unwrap(), Format::Bytes) {
            for ide_modif in ide_modifs.iter_mut() {
                // ide_modif.offset = self.file.as_mut().unwrap().char_to_byte(ide_modif.offset);
                // ide_modif.delete = self.file.as_mut().unwrap().char_to_byte(ide_modif.delete);
            }
        }

        self.server_sent_delta = new_server_sent_delta;
        self.server_unsent_delta = new_server_unsent_delta;

        self.ide_unsent_delta = self.ide_unsent_delta.compose(&modif.delta).unwrap();
        self.submit_ide_change().await;
    }

    async fn submit_ide_change(&mut self) {
        let ide_modifs = to_ide_changes(&self.ide_unsent_delta);
        self.ide
            .send(MessageIde::Update {
                changes: ide_modifs,
            })
            .await;
        self.ide_ack = false;
        self.ide_sent_delta = self.ide_unsent_delta.clone();
        self.ide_unsent_delta = OperationSeq::default();
        self.ide_unsent_delta
            .retain(self.ide_sent_delta.target_len() as u64);
    }

    async fn on_request_file(&mut self) {
        let _ = self.ide.send(MessageIde::RequestFile).await;
    }

    async fn on_receive_file(&mut self, file: String, version: usize) {
        self.file = Some(File::new(&file));
        self.server_state.retain(file.len() as u64);
        self.server_sent_delta.retain(file.len() as u64);
        self.server_unsent_delta.retain(file.len() as u64);
        self.ide_sent_delta.retain(file.len() as u64);
        self.ide_unsent_delta.retain(file.len() as u64);
        self.ide.send(MessageIde::File { file }).await;
        self.rev_num = version;
    }

    async fn on_ide_file(&mut self, file: String) {
        self.rev_num = 0;
        self.file = Some(File::new(&file));
        self.server_state.retain(file.len() as u64);
        self.server_sent_delta.retain(file.len() as u64);
        self.server_unsent_delta.retain(file.len() as u64);
        self.ide_sent_delta.retain(file.len() as u64);
        self.ide_unsent_delta.retain(file.len() as u64);
        let _ = self
            .server
            .send(MessageServer::File { file, version: 0 })
            .await;
    }

    async fn on_ide_change(&mut self, mut changes: Vec<TextModification>) {
        if self.format.is_none() {
            let _ = self
                .ide
                .send(MessageIde::Error {
                    error: "Error: Offset format was not set by IDE".into(),
                })
                .await;
            return;
        }

        if self.file.is_none() {
            let _ = self
                .ide
                .send(MessageIde::Error {
                    error: "Error: Unknown file".into(),
                })
                .await;
            return;
        }

        if matches!(self.format.as_ref().unwrap(), Format::Bytes) {
            for change in changes.iter_mut() {
                // change.offset = self.file.as_mut().unwrap().byte_to_char(change.offset);
                // change.delete = self.file.as_mut().unwrap().byte_to_char(change.delete);
            }
        }
        let ide_seq =
            match modifs_to_operation_seq(&changes, &(self.server_unsent_delta.target_len() as u64))
            {
                Ok(seq) => seq,
                Err(err) => {
                    self.ide
                        .send(MessageIde::Error {
                            error: err.to_string(),
                        })
                        .await;
                    return;
                }
            };

        if !self.ide_ack {
            let (updated_ide_change, new_ide_sent_delta) =
                ide_seq.transform(&self.ide_sent_delta).unwrap();
            let (server_delta, new_ide_unsent_delta) = updated_ide_change
                .transform(&self.ide_unsent_delta)
                .unwrap();

            self.server_unsent_delta = self
                .server_unsent_delta
                .compose(&ide_seq)
                .expect("modifs_to_operation_seq result should be length compatible with op_seq");

            self.ide_sent_delta = new_ide_sent_delta;
            self.ide_unsent_delta = new_ide_unsent_delta;

            /*(self.ide_sent_delta, _) = self.ide_sent_delta.transform(&ide_seq).unwrap();
            (self.ide_unsent_delta, _) = self.ide_unsent_delta.transform(&ide_seq).unwrap();*/

            self.ide.send(MessageIde::Ack).await;
            self.ide
                .send(MessageIde::Update {
                    changes: to_ide_changes(&self.ide_sent_delta),
                })
                .await;
        } else {
            self.server_unsent_delta = self.server_unsent_delta.compose(&ide_seq).unwrap();
            
            if self.server_sent_delta.is_noop() && !self.server_unsent_delta.is_noop() {
                self.submit_server_change().await;
            }
        }
    }

    async fn on_ide_format(&mut self, format: Format) {
        self.format = Some(format);
    }

    async fn on_ide_ack(&mut self) {
        if self.ide_ack {
            self.ide
                .send(MessageIde::Error {
                    error: "ack not ok".to_owned(),
                })
                .await;
        } else {
            if !self.ide_unsent_delta.is_noop() {
                self.submit_ide_change().await;
            } else {
                self.ide_sent_delta = OperationSeq::default();
            }
        }
    }

    pub async fn on_message_server(&mut self, message: MessageServer) {
        match message {
            MessageServer::ServerUpdate(modif) => self.on_server_change(&modif).await,
            MessageServer::Ack => self.on_ack().await,
            MessageServer::Error { error: err } => self.on_server_error(err).await,
            MessageServer::RequestFile => self.on_request_file().await,
            MessageServer::File { file, version } => self.on_receive_file(file, version).await,
        }
    }

    pub async fn on_message_ide(&mut self, message_ide: MessageIde) {
        match message_ide {
            MessageIde::Update { changes } => self.on_ide_change(changes).await,
            MessageIde::Declare(format) => self.on_ide_format(format).await,
            MessageIde::File { file } => self.on_ide_file(file).await,
            MessageIde::RequestFile => warn!("IDE sent RequestFile"),
            MessageIde::Error { .. } => warn!("IDE sent error"),
            MessageIde::Ack => self.on_ide_ack().await,
        }
    }
}
