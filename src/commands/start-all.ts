import { ProgressLocation, window, commands } from "vscode";

import { getConfig } from '../common/config-utils';
import { startContainers } from "../common/start-container";

export const disposableStartAll = commands.registerCommand('docker-run.start:all', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Starting All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });

        await startContainers(containers, progress);
    }));
});
