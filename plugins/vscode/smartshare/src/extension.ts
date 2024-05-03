import * as vscode from 'vscode';
import { logClient, logServer } from './utils';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Declare, File, Message, RequestFile, Update, isMessage, matchMessage } from './message';
import { Ctx } from './ctx';

let changes_to_discard = new Array();


function applyUpdateAction(update: Update) {
    update.write();
    changes_to_discard.push(JSON.stringify(update));
}

function clientStdoutHandler(ctx: Ctx): (chunk: any) => void {
    let data_line = "";
    return function (data) {
        const lines = data.split("\n");
        for (let line of lines) {
            data_line += line;
            if (data_line.length > 0) {
                logClient.debug(data_line);
                const data = JSON.parse(data_line);
                if (!isMessage(data)) {
                    logClient.error("invalid action " + data.action)
                    break;
                }
                handleMessage(ctx, data);
            }
            data_line = '';
        }
        data_line = lines[lines.length - 1];
    }
}

function handleMessage(ctx: Ctx, data: Message) {
    const editor = vscode.window.activeTextEditor;
    matchMessage(data)(
        (update: Update) => {
            applyUpdateAction(update);
        },
        (declare: Declare) => {
            logClient.error("Recieved invalid action declare" + declare)
        },
        (error: Error) => {
            logClient.error("From client: " + error)
        },
        (_: RequestFile) => {
            ctx.clientProc?.stdin.write(JSON.stringify({
                file: vscode.window.activeTextEditor?.document.getText()
            }));
        },
        (file: File) => {
            editor?.edit((editBuilder: vscode.TextEditorEdit) => {
                editBuilder.replace(new vscode.Range(
                    editor.document.positionAt(0),
                    editor.document.positionAt(editor.document.getText().length)
                ), file.file);
            }).then(success => {
                if (success) {
                    vscode.window.showInformationMessage('Text inserted');
                } else {
                    vscode.window.showErrorMessage('Failed to insert text');
                }
            });
        }
    );
}

function changeDocumentHandler(ctx: Ctx): (e: vscode.TextDocumentChangeEvent) => any {
    return (event) => {
        console.log(event);

        for (let change of event.contentChanges) {

            const message = new Update(
                change.rangeOffset,
                change.rangeLength,
                change.text
            );

            if (changes_to_discard[changes_to_discard.length - 1] == JSON.stringify(message)) {
                changes_to_discard.pop();
            } else {
                console.log(JSON.stringify(message));
                ctx.clientProc?.stdin.write(JSON.stringify(message) + '\n');
            }
        }
    }
}

export async function activate(context: vscode.ExtensionContext) {

    let statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Disconnected";
    statusBarItem.show();

    const exePath = __dirname + '/../../../../smartshare/target/debug/';
    let ctx = new Ctx(exePath, statusBarItem);


    context.subscriptions.push(vscode.commands.registerCommand('smartshare.createSession', () => {

        if (ctx.serverProc?.pid) {
            vscode.window.showInformationMessage("Already hosting a session")
            return;
        }

        ctx.serverProc = spawn(exePath + "server", [], { env: { CARGO_LOG: 'trace' } });
        if (!ctx.serverProc.pid) {
            vscode.window.showInformationMessage("Failed to start server")
            return;
        }

        ctx.serverProc.stdout.on("data", function (data) {
            logServer.subprocess(ctx.serverProc?.pid || 0, data + "");
        });

        ctx.serverProc.stderr.on("data", function (data) {
            logServer.subprocess(ctx.serverProc?.pid || 0, data + "");
        });

        vscode.window.showInformationMessage("Created a SmartShare session");
        ctx.startClient("127.0.0.1:4903", clientStdoutHandler, changeDocumentHandler, context);
    }));


    context.subscriptions.push(vscode.commands.registerCommand('smartshare.joinSession', async () => {

        if (ctx.clientProc?.pid) {
            vscode.window.showInformationMessage("Already connected to a session")
            return;
        }

        const addr = await vscode.window.showInputBox(
            { prompt: "IP Address", value: "127.0.0.1" }
        );

        if (!addr) {
            vscode.window.showInformationMessage("Could not get address, aborting")
            return;
        }

        ctx.startClient(addr + ":4903", clientStdoutHandler, changeDocumentHandler, context);

        vscode.window.showInformationMessage("Connected to Smartshare session");
    }));

    context.subscriptions.push(vscode.commands.registerCommand('smartshare.disconnect', async () => {
        if (ctx.serverProc?.pid) {
            vscode.window.showWarningMessage("Are you sure you want to stop the server?", { modal: true }, "Yes").then((value) => {
                if (value === "Yes") {
                    ctx.serverProc?.removeAllListeners();
                    ctx.serverProc?.kill();
                    if (ctx.disposable && ctx.clientProc) {
                        ctx.stopClient(ctx.disposable, ctx.clientProc);
                    }
                } else {
                    return;
                }
            });
        } else if (ctx.disposable && ctx.clientProc) {
            ctx.stopClient(ctx.disposable, ctx.clientProc);
        }

    }));

}

export function deactivate() {
    vscode.commands.executeCommand('smartshare.disconnect');
}
