import * as vscode from 'vscode';
import {spawn} from 'child_process';


export function activate(context: vscode.ExtensionContext) {

    let event_sent = new Array();

	var childProcess = spawn('python', ['test.py']);

	childProcess.stdout.setEncoding('utf8')

	var data_line = '';

	childProcess.stdout.on("data", function(data) {
		const lines = data.split("\n");
		for (let line of lines) {
			data_line += line;
			if(data_line.length>0) {
				console.log(data_line);
			}
			data_line = ''
		}
		data_line = lines[lines.length-1];
	});

	let disposable = vscode.workspace.onDidChangeTextDocument(event => {

        for (let change of event.contentChanges) {

            if (event_sent[event_sent.length-1] == (change.range, change.text)) {
                event_sent.pop();
                vscode.window.showInformationMessage('Caught event');
            } else {
                console.log(change);

                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    editor.edit((editBuilder: vscode.TextEditorEdit) => {
                        event_sent.push((change.range, change.text));
                        editBuilder.replace(change.range, change.text);
                    }).then(success => {
                        if (success) {
                            vscode.window.showInformationMessage('Text inserted');
                        } else {
                            vscode.window.showErrorMessage('Failed to insert text');
                        }
                    });
                }
            }

        }
    });

    context.subscriptions.push(disposable);

}

export function deactivate() {}
