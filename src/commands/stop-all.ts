import { ProgressLocation, window, commands } from "vscode";

import { getWorkspaceContainers, ContainerList } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {

    const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!containerList.length) {
        window.showWarningMessage('No Containers Found For This Workspace');
        return;
    }

    await ext.stopOperation.operateContainers(containerList, true);
});
