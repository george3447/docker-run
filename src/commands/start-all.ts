import { ProgressLocation, window, commands, ExtensionContext } from "vscode";

import { getConfig } from '../common/config-utils';
import { startContainers } from "../common/start-container";

export async function startAll() {

    const progressOptions = { location: ProgressLocation.Notification, title: 'Starting All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });

        await startContainers(containers, progress);
    }));
}

export function registerStartAll(context: ExtensionContext) {
    let disposable = commands.registerCommand('docker-run.start:all', async () => {
        await startAll();
    });
    context.subscriptions.push(disposable);
}