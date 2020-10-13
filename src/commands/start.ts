import { commands, window } from "vscode";

import { ContainerList, getWorkspaceContainers } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStart = commands.registerCommand('docker-run.start', async () => {

    const stoppedContainerList = await getWorkspaceContainers(false, false).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (!stoppedContainerList) {
        window.showWarningMessage(`Please Add At Least One Container To Workspace`);
        return;
    }

    if (!stoppedContainerList.length) {
        window.showWarningMessage(`All Containers For Current Workspace Are Running`);
        return;
    }

    const selection = await window.showQuickPick(stoppedContainerList, { canPickMany: true, placeHolder: 'Select Container' });
    if (selection && selection.length > 0) {
        await ext.startOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(`Please Select At least One Container To Start`);
        return;
    }

});

