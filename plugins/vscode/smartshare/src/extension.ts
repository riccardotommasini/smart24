import * as vscode from 'vscode';
import { logClient, logServer } from './utils';
import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { Ack, Declare, File, Message, RequestFile, TextModification, Update, isMessage, matchMessage } from './message';

let waitingAcks = 0;
//let changes_to_discard = new Array();
let clientProc: ChildProcessWithoutNullStreams | undefined;
let serverProc: ChildProcessWithoutNullStreams | undefined;
let disposable: vscode.Disposable | undefined;
let exePath = __dirname + '/../../../../smartshare/target/debug/';
let statusBarItem: vscode.StatusBarItem;
let context: vscode.ExtensionContext;
let init = true;
let ignoreNextEvent = false;

function procWrite(proc: ChildProcessWithoutNullStreams, message: any): void {
    logClient.debug("Send message", message);
    proc.stdin.write(JSON.stringify(message)+'\n');
}

async function applyChange(change: TextModification): Promise<boolean> {
    //changes_to_discard.push(JSON.stringify(change));
    ignoreNextEvent = true;
    return change.write()
}

function clientStdoutHandler(): (chunk: any) => void {
    let data_line = "";
    return (data) => {
        const lines = data.split("\n");
        for (let line of lines) {
            data_line += line;
            if (data_line.length > 0) {
                logClient.debug("recieved data", data_line);
                const data = JSON.parse(data_line);
                if (!isMessage(data)) {
                    logClient.error("invalid action " + data.action)
                    break;
                }
                handleMessage(data);
            }
            data_line = '';
        }
        data_line = lines[lines.length - 1];
    }
}

function handleMessage(data: Message) {
    const editor = vscode.window.activeTextEditor;
    matchMessage(data)(
        (update: Update) => {
            if (!waitingAcks) {
                for (const change of update.changes) {
                    applyChange(change).then((success) => {
                        if (success && clientProc) {
                            //clientProc?.stdin.write(JSON.stringify({ action: "ack" }))
                            procWrite(clientProc,{ action: "ack" })
                        }
                    })
                }
            } else {
                logClient.debug("Ignore update before acknowledge", update)
            }
        },
        (declare: Declare) => {
            logClient.error("Recieved invalid action declare", declare)
        },
        (error: Error) => {
            logClient.error("From client: ", error)
        },
        (_: RequestFile) => {
            if(!clientProc){
                return;
            }
            procWrite(clientProc, {
                action: "file",
                file: vscode.window.activeTextEditor?.document.getText()
            })
            init = false;
        },
        (file: File) => {
            ignoreNextEvent = false;
            new TextModification(0, editor?.document.getText().length || 0, file.file)
                .write()
                .catch(err => logClient.error(err));
            init = false;
        },
        (_: Ack) => {
            if (!waitingAcks) {
                logClient.info("Recieved unexpected ack");
            } else {
                waitingAcks--;
            }
        }
    );
}

function changeDocumentHandler(event: vscode.TextDocumentChangeEvent): any {

    if(event.document.uri.path.startsWith("extension-output")) {
        return;
    }

    console.log(event.document.uri);

    if(init) {
        return;
    }

    for (let change of event.contentChanges) {

        const message = {
            action: "update",
            changes: [new TextModification(
                change.rangeOffset,
                change.rangeLength,
                change.text)
            ]
        };

        // if (changes_to_discard[changes_to_discard.length - 1] == JSON.stringify(message)) {
        //     changes_to_discard.pop();
        // } else {
        //     console.log(JSON.stringify(message));
        //     clientProc?.stdin.write(JSON.stringify(message) + '\n');
        //     waitingAcks++;
        // }
        if (ignoreNextEvent) {
            ignoreNextEvent = false;
        } else if (clientProc) {
            console.log(JSON.stringify(message));
            //clientProc?.stdin.write(JSON.stringify(message) + '\n');
            procWrite(clientProc, message);
            waitingAcks++;
        }
    }
}

function startClient(addr: string) {

    clientProc = spawn(exePath + "client", [addr], { env: { RUST_LOG: 'trace' } });
    if (!clientProc.pid) {
        vscode.window.showInformationMessage("Failed to run executable, aborting")
        return;
    }
    logClient.info(`Launched client subprocess at pid ${clientProc.pid}`);

    statusBarItem.text = "Connected";
    clientProc.stdout.setEncoding('utf8');
    const message = { action: "declare", offset_format: "chars" };
    //logClient.debug(message);
    //clientProc.stdin.write(JSON.stringify(message));
    procWrite(clientProc, message);
    clientProc.on('close', () => {
        vscode.window.showErrorMessage("Client closed");
        vscode.commands.executeCommand('smartshare.disconnect');
    });

    clientProc.stdout.on("data", clientStdoutHandler());

    clientProc.stderr.on("data", (data) => {
        logClient.subprocess(clientProc?.pid || 0, data + "");
        console.log(data + "");
    });

    disposable = vscode.workspace.onDidChangeTextDocument(changeDocumentHandler);

    //context.subscriptions.push(disposable);
}

function stopClient(disposable: vscode.Disposable, clientProc: ChildProcessWithoutNullStreams) {
    if (clientProc?.pid) {
        disposable.dispose();
        clientProc.removeAllListeners();
        clientProc.kill();
        vscode.window.showInformationMessage("Disconnected");
    } else {
        vscode.window.showErrorMessage("Already disconnected");
    }
    statusBarItem.text = "Disconnected";
}

export async function activate(context: vscode.ExtensionContext) {

    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "Disconnected";
    statusBarItem.show();


    context.subscriptions.push(vscode.commands.registerCommand('smartshare.createSession', () => {

        if (serverProc?.pid) {
            vscode.window.showInformationMessage("Already hosting a session")
            return;
        }

        serverProc = spawn(exePath + "server", [], { env: { RUST_LOG: 'trace' } });
        if (!serverProc.pid) {
            vscode.window.showInformationMessage("Failed to start server")
            return;
        }

        serverProc.stdout.on("data", function (data) {
            logServer.subprocess(serverProc?.pid || 0, data + "");
        });

        serverProc.stderr.on("data", function (data) {
            logServer.subprocess(serverProc?.pid || 0, data + "");
        });

        vscode.window.showInformationMessage("Created a SmartShare session");
        startClient("127.0.0.1:4903");
    }));


    context.subscriptions.push(vscode.commands.registerCommand('smartshare.joinSession', async () => {

        if (clientProc?.pid) {
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

        startClient(addr + ":4903");

        vscode.window.showInformationMessage("Connected to Smartshare session");
    }));

    context.subscriptions.push(vscode.commands.registerCommand('smartshare.disconnect', async () => {
        if (serverProc?.pid) {
            vscode.window.showWarningMessage("Are you sure you want to stop the server?", { modal: true }, "Yes").then((value) => {
                if (value === "Yes") {
                    serverProc?.removeAllListeners();
                    serverProc?.kill();
                    if (disposable && clientProc) {
                        stopClient(disposable, clientProc);
                    }
                } else {
                    return;
                }
            });
        } else if (disposable && clientProc) {
            stopClient(disposable, clientProc);
        }

    }));

}

export function deactivate() {
    vscode.commands.executeCommand('smartshare.disconnect');
}
