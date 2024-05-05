import * as vscode from "vscode";
import { inspect } from "util";


// from rust-analyzer
class RustLog {
    private enabled = true;
    private readonly output;

    constructor(name: string) {
        this.output = vscode.window.createOutputChannel(name);
    }

    setEnabled(yes: boolean): void {
        this.enabled = yes;
    }

    // Hint: the type [T, ...T[]] means a non-empty array
    debug(...msg: [unknown, ...unknown[]]): void {
        if (!this.enabled) return;
        this.write("DEBUG", ...msg);
    }

    info(...msg: [unknown, ...unknown[]]): void {
        this.write("INFO", ...msg);
    }

    warn(...msg: [unknown, ...unknown[]]): void {
        debugger;
        this.write("WARN", ...msg);
    }

    error(...msg: [unknown, ...unknown[]]): void {
        debugger;
        this.write("ERROR", ...msg);
        this.output.show(true);
    }

    subprocess(...msg: [unknown, ...unknown[]]) : void {
        this.output.appendLine(msg.map(this.stringify).join(" "));
    }

    private write(label: string, ...messageParts: unknown[]): void {
        const message = messageParts.map(this.stringify).join(" ");
        const dateTime = new Date().toISOString()
        this.output.appendLine(`${dateTime} ${label}: ${message}`);
    }

    private stringify(val: unknown): string {
        if (typeof val === "string") return val;
        return inspect(val, {
            colors: false,
            depth: 6, // heuristic
        });
    }
};


export const logClient = new RustLog("SmartShare Client");
export const logServer = new RustLog("SmartShare Server");
