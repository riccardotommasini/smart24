import { ChildProcessByStdio, ChildProcessWithoutNullStreams, spawn } from "child_process";
import * as vscode from "vscode";
import { logClient } from "./utils";

export class Ctx {
    changes_to_discard = new Array();
    clientProc: ChildProcessWithoutNullStreams | undefined;
    serverProc: ChildProcessWithoutNullStreams | undefined;
    disposable: vscode.Disposable | undefined;
    exePath: string
    statusBarItem: vscode.StatusBarItem;

    constructor(exePath: string, statusBarItem: vscode.StatusBarItem) {
        this.exePath = exePath;
        this.statusBarItem = statusBarItem;
    }

    startClient(
        addr: string,
        stdoutHandler: (ctx: Ctx) => (chunk: any) => void,
        changeDocumentHandler: (ctx: Ctx) => (e: vscode.TextDocumentChangeEvent) => any,
        context: vscode.ExtensionContext
    ) {

        this.clientProc = spawn(this.exePath + "client", [addr], { env: { CARGO_LOG: 'trace' } });
        if (!this.clientProc.pid) {
            vscode.window.showInformationMessage("Failed to run executable, aborting")
            return;
        }
        logClient.info(`Launched client subprocess at pid ${this.clientProc.pid}`);

        this.statusBarItem.text = "Connected";
        this.clientProc.stdout.setEncoding('utf8');

        this.clientProc.stdin.write(JSON.stringify({ action: "declare", offset_format: "chars" }) + "\n");

        this.clientProc.on('close', () => {
            vscode.window.showErrorMessage("Client closed");
            vscode.commands.executeCommand('smartshare.disconnect');
        });

        this.clientProc.stdout.on("data", stdoutHandler(this));

        this.clientProc.stderr.on("data", (data) => {
            logClient.subprocess(this.clientProc?.pid || 0, data + "");
            console.log(data + "");
        });

        this.disposable = vscode.workspace.onDidChangeTextDocument(changeDocumentHandler(this));

        context.subscriptions.push(this.disposable);
    }

    stopClient(disposable: vscode.Disposable, clientProc: ChildProcessWithoutNullStreams) {
        if (clientProc?.pid) {
            disposable.dispose();
            clientProc.removeAllListeners();
            clientProc.kill();
            vscode.window.showInformationMessage("Disconnected");
        } else {
            vscode.window.showErrorMessage("Already disconnected");
        }
        this.statusBarItem.text = "Disconnected";
    }
}