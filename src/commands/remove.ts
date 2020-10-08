import { commands, window } from "vscode";

import { getContainersList, ContainerList, extractContainerIds } from "../common/list";
import { writeConfig } from "../common/config";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableRemove = commands.registerCommand('docker-run.remove', async () => {
    const containerList = await getContainersList(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!containerList.length) {
        window.showWarningMessage(`Please Add At least One Container To Workspace`);
        return;
    }

    const selection = await window.showQuickPick(containerList, {
        canPickMany: true,
        placeHolder: 'Select Containers You Need To Remove From This Workspace'
    });

    if (selection && selection.length > 0) {
        const containerIds = extractContainerIds(containerList
            .filter(({ containerId }) => selection
                .findIndex(({ containerId: selectedContainerId }) => selectedContainerId === containerId) === -1));

        await writeConfig(containerIds);
        await ext.stopOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(`Please Select At least One Container To Remove`);
        return;
    }

});