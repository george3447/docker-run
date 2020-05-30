import { ProgressLocation, window, commands, ExtensionContext } from "vscode";

import { getConfig } from "../common/config-utils";
import { stopContainers } from "../common/stop-container";

export async function stopAll() {

    const progressOptions = { location: ProgressLocation.Notification, title: 'Stopping All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });

        await stopContainers(containers, progress);

    }));
}

export function registerStopAll(context: ExtensionContext) {
    let disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {
        await stopAll();
    });
    context.subscriptions.push(disposableStopAll);
}