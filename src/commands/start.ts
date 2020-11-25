import { commands, window } from "vscode";

import { getWorkspaceContainers } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";
import * as messages from "../common/messages";

export const disposableStart = commands.registerCommand('docker-run.start', async () => {

    const stoppedContainerList = await getWorkspaceContainers(false, false).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (!stoppedContainerList) {
        window.showWarningMessage(messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE);
        return;
    }

    if (!stoppedContainerList.length) {
        window.showWarningMessage(messages.ALL_CONTAINERS_ARE_RUNNING);
        return;
    }

    const selection = await window.showQuickPick(stoppedContainerList, { canPickMany: true, placeHolder: 'Select Container' });
    if (selection && selection.length > 0) {
        await ext.startOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_START);
        return;
    }

});

