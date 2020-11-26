import { commands, window } from "vscode";

import { getWorkspaceContainers } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";
import * as messages from "../common/messages";

export const disposableStop = commands.registerCommand('docker-run.stop', async () => {

    const runningContainerList = await getWorkspaceContainers(false, true).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (!runningContainerList) {
        window.showWarningMessage(messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE);
        return;
    }

    if (!runningContainerList.length) {
        window.showWarningMessage(messages.ALL_CONTAINERS_ARE_STOPPED);
        return;
    }

    if (!runningContainerList.length) {
        window.showInformationMessage(messages.NO_RUNNING_CONTAINERS_FOUND);
        return;
    }

    const selection = await window.showQuickPick(runningContainerList, { canPickMany: true, placeHolder: 'Select Container' });
    if (selection && selection.length > 0) {
        await ext.stopOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_STOP);
        return;
    }

});

