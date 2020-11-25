import { window, commands } from "vscode";

import { getWorkspaceContainers, ContainerList } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";
import * as messages from "../common/messages";

export const disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {

    const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!containerList.length) {
        window.showWarningMessage(messages.NO_CONTAINERS_FOUND_FOR_THIS_WORKSPACE);
        return;
    }

    await ext.stopOperation.operateContainers(containerList, true);
});
