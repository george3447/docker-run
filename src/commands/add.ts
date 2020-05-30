import { ExtensionContext, commands } from "vscode";

import { add } from "../common/add";

export function registerAdd(context: ExtensionContext) {

    let disposableAdd = commands.registerCommand('docker-run.add', async () => {
        await add();
    });

    context.subscriptions.push(disposableAdd);
}