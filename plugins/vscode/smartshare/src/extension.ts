import * as vscode from 'vscode';
import {spawn} from 'child_process';


class Change {

    offset: number;
    deleted: number;
    inserted: string;

    constructor(offset: number, deleted: number, inserted: string) {
        this.offset = offset;
        this.deleted = deleted;
        this.inserted = inserted;
    }

    range() {
        return new vscode.Range(
            new vscode.Position(0, this.offset),
            new vscode.Position(0, this.offset + this.deleted)
        );
    }

}

function write_change(change: Change) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(change.range(), change.inserted);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage('Text inserted');
            } else {
                vscode.window.showErrorMessage('Failed to insert text');
            }
        });
    }
}


export function activate(context: vscode.ExtensionContext) {

    var childProcess = spawn('python', [__dirname + '/../src/test.py']);
	childProcess.stdout.setEncoding('utf8')
    
    var changes_to_discard = new Array();
	var data_line = '';
    
	childProcess.stdout.on("data", function(data) {
        const lines = data.split("\n");
		for (let line of lines) {
            data_line += line;
			if (data_line.length > 0) {
                data = JSON.parse(data_line);
                if (data.offset === undefined || data.deleted === undefined || data.inserted === undefined) {
                    vscode.window.showInformationMessage('Received invalid JSON');
                }
                const change = new Change(data.offset, data.deleted, data.inserted);
                write_change(change);
                changes_to_discard.push(JSON.stringify(change));
			}
			data_line = ''
		}
		data_line = lines[lines.length-1];
	});

    
	let disposable = vscode.workspace.onDidChangeTextDocument(event => {

        for (let change of event.contentChanges) {

            const message = new Change(change.rangeOffset, change.rangeLength, change.text);

            if (changes_to_discard[changes_to_discard.length-1] == JSON.stringify(message)) {
                changes_to_discard.pop();
                // vscode.window.showInformationMessage('Caught event');
            } else {
                console.log(JSON.stringify(message));
                childProcess.stdin.write(JSON.stringify(message) + '\n');
            }
        }
    });

    context.subscriptions.push(disposable);

}

export function deactivate() {}
