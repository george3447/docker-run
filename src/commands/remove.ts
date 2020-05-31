import { commands, window } from "vscode";

import { getContainersList, ContainerList, extractContainerIds } from "../common/docker-utils";
import { writeConfig } from "../common/config-utils";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error-utils";

export const disposableRemove = commands.registerCommand('docker-run.remove', async () => {
    const containerList = await getContainersList(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!containerList.length) {
        return window.showInformationMessage(`Please Add At least One Container`);
    }

    const selection = await window.showQuickPick(containerList, {
        canPickMany: true,
        placeHolder: 'Select Containers You Need To Remove From This Workspace'
    });

    if (selection && selection.length > 0) {
        const containerIds = extractContainerIds(containerList.filter(containerListItem => !selection.includes(containerListItem)));
        await writeConfig(containerIds);
        await ext.stopOperation.operateContainers(selection);
    }

});