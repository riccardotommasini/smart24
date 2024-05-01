import * as vscode from 'vscode';
import {ChildProcess, ChildProcessWithoutNullStreams, spawn} from 'child_process';
import {log} from './utils';


class Change {

    offset: number;
    delete: number;
    text: string;
    action = 'i_d_e_update';

    constructor(offset: number, deleted: number, inserted: string) {
        this.offset = offset;
        this.delete = deleted;
        this.text = inserted;
    }

    range() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            throw new Error('No active text editor');
        }
        return new vscode.Range(
            editor.document.positionAt(this.offset),
            editor.document.positionAt(this.offset + this.delete)
        );
    }

}

function write_change(change: Change) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
    //editor.selections = [...editor.selections, new vscode.Selection(0,0,0,1)]
        editor.edit((editBuilder: vscode.TextEditorEdit) => {
            editBuilder.replace(change.range(), change.text);
        }).then(success => {
            if (success) {
                vscode.window.showInformationMessage('Text inserted');
            } else {
                vscode.window.showErrorMessage('Failed to insert text');
            }
        });
    }
}

export async function activate(context: vscode.ExtensionContext) {
    let statusBarItem: vscode.StatusBarItem;
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "DISCONNECTED";
    statusBarItem.show();

    let disposable: vscode.Disposable;

    let childProcess: ChildProcessWithoutNullStreams;

    context.subscriptions.push(vscode.commands.registerCommand('smartshare.start', async () => {

        const addr = await vscode.window.showInputBox({prompt:"IP Address"});

        if(!addr) {
            vscode.window.showInformationMessage("Could not get address, aborting.")
            return;
        }
    
        const client_executable = __dirname + '/client';
        childProcess = spawn(client_executable, [addr]);
        if (!childProcess.pid) {
            return;
        }
        log.info(`Launched client subprocess at pid ${childProcess.pid}`);
        childProcess.stdout.setEncoding('utf8');
        statusBarItem.text = "CONNECTED";

        childProcess.on('close', () => {
            vscode.window.showErrorMessage("Client closed");
            vscode.commands.executeCommand('smartshare.stop');
        });
        
        var changes_to_discard = new Array();
        var data_line = '';
        
        childProcess.stdout.on("data", function(data) {
            const lines = data.split("\n");
            for (let line of lines) {
                data_line += line;
                if (data_line.length > 0) {
                    log.debug(data_line);
                    data = JSON.parse(data_line);
                    if (data.offset === undefined || data.delete === undefined || data.text === undefined) {
                        vscode.window.showErrorMessage('Received invalid JSON');
                    }
                    const change = new Change(data.offset, data.delete, data.text);
                    write_change(change);
                    changes_to_discard.push(JSON.stringify(change));
                }
                data_line = ''
            }
            data_line = lines[lines.length-1];
        });
    
        childProcess.stderr.on("data", function(data) {
            log.subprocess(childProcess.pid || 0, data+"");
            console.log(data+"");
        });
    
        
        disposable = vscode.workspace.onDidChangeTextDocument(event => {
    
            console.log(event);
    
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
	}));

    context.subscriptions.push(vscode.commands.registerCommand('smartshare.stop', async () => {
        disposable.dispose();
        if(childProcess) {
            childProcess.removeAllListeners();
            childProcess.kill();
            vscode.window.showInformationMessage("Disconnected SmartShare");
        } else {
            vscode.window.showErrorMessage("Already disconnected");
        }
        statusBarItem.text = "DISCONNECTED";
    }));

}

export function deactivate() {}
