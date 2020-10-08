import { commands, window } from "vscode";

import { getWorkspaceContainers } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStop = commands.registerCommand('docker-run.stop', async () => {

    const runningContainerList = await getWorkspaceContainers(false, true).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (runningContainerList) {

        if (!runningContainerList.length) {
            return window.showInformationMessage(`No Running Containers Found`);
        }

        const selection = await window.showQuickPick(runningContainerList, { canPickMany: true, placeHolder: 'Select Container' });

        if (selection && selection.length > 0) {

            await ext.stopOperation.operateContainers(selection);
        }
    }
});

