import { ProgressLocation, window, commands } from "vscode";

import { getConfig } from "../common/config-utils";
import { stopContainers } from "../common/stop-container";

export const disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Stopping All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });

        await stopContainers(containers, progress);

    }));
});
