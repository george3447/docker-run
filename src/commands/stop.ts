import { commands, window } from "vscode";

import { getContainersList } from "../common/docker-utils";
import { stopContainersByLabels } from "../common/stop-container";

export const disposableStop = commands.registerCommand('docker-run.stop', async () => {

    const runningContainerList = await getContainersList(false, true).catch((error: Error) => {
        window.showWarningMessage(error.message);
        return;
    });

    if (runningContainerList) {

        if (!runningContainerList.length) {
            return window.showInformationMessage(`No Running Containers Found`);
        }

        const selection = await window.showQuickPick(runningContainerList, { canPickMany: true, placeHolder: 'Select Container' });

        if (selection && selection.length > 0) {

            await stopContainersByLabels(selection);
        }
    }
});

