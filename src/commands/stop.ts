import { commands, window } from "vscode";

import { getWorkspaceContainers } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStop = commands.registerCommand('docker-run.stop', async () => {

    const runningContainerList = await getWorkspaceContainers(false, true).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (!runningContainerList) {
        window.showWarningMessage(`Please Add At Least One Container To Workspace`);
        return;
    }

    if (!runningContainerList.length) {
        window.showWarningMessage(`All Containers For Current Workspace Are Stopped`);
        return;
    }

    if (!runningContainerList.length) {
        return window.showInformationMessage(`No Running Containers Found`);
    }

    const selection = await window.showQuickPick(runningContainerList, { canPickMany: true, placeHolder: 'Select Container' });
    if (selection && selection.length > 0) {
        await ext.stopOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(`Please Select At least One Container To Stop`);
        return;
    }

});

