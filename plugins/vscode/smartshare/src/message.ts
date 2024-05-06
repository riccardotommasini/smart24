import * as vscode from 'vscode';
import { logClient } from './utils';

export type Message = Update | Declare | Error | RequestFile | File | Ack | Cursors;

export interface Update {
    action: "update"
    changes: TextModification[]
}

export class TextModification {
    offset: number
    delete: number
    text: string

    constructor(offset: number, deleteParam: number, text: string) {
        this.offset = offset;
        this.delete = deleteParam;
        this.text = text;
    }

    async write(editor: vscode.TextEditor): Promise<boolean> {
        const success = await editor.edit((editBuilder: vscode.TextEditorEdit) => {
            const range = new vscode.Range(
                editor.document.positionAt(this.offset),
                editor.document.positionAt(this.offset + this.delete)
            );
            editBuilder.replace(range, this.text);
        });
        if (!success) {
            logClient.error("Unable to apply change", this)
        }
        return success;
    }
}

export interface Declare {
    action: "declare"
    offset_format: "bytes" | "chars"
}

export interface Error {
    action: "error"
    error: string
}

export interface RequestFile {
    action: "request_file"
}

export interface File {
    action: "file"
    file: string
}

export interface Ack {
    action: "ack"
}

export interface Cursors {
    action: "cursor"
    id: number
    cursors: Cursor[]
}

export interface Cursor {
    cursor: number
    anchor: number
}

export function isMessage(object: any): object is Message {
    return ["update", "declare", "error", "request_file", "file", "ack", "cursor"].includes(object.action);
}

export function matchMessage(message: Message): any {
    return (
        onUpdate: (x: Update) => any,
        onDeclare: (x: Declare) => any,
        onError: (x: Error) => any,
        onRequestFile: (x: RequestFile) => any,
        onFile: (x: File) => any,
        onAck: (x: Ack) => any,
        onCursor: (x: Cursors) => any,
    ) => {
        switch (message.action) {
            case "update":
                return onUpdate(message);
            case "declare":
                return onDeclare(message);
            case "error":
                return onError(message);
            case "request_file":
                return onRequestFile(message);
            case "file":
                return onFile(message);
            case "ack":
                return onAck(message);
            case "cursor":
                return onCursor(message);
        }
    }
}