import { commands, window } from "vscode";

import { getWorkspaceContainers, ContainerList, extractContainerIds } from "../common/list";
import { writeConfig } from "../common/config";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";
import * as messages from "../common/messages";

export const disposableRemove = commands.registerCommand('docker-run.remove', async () => {
    const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!containerList.length) {
        window.showWarningMessage(messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE);
        return;
    }

    const selection = await window.showQuickPick(containerList, {
        canPickMany: true,
        placeHolder: messages.SELECT_CONTAINERS_TO_REMOVE
    });

    if (selection && selection.length > 0) {
        const containerIds = extractContainerIds(containerList
            .filter(({ containerId }) => selection
                .findIndex((selectedItem) => selectedItem.containerId === containerId) < 0));

        await ext.stopOperation.operateContainers(selection);
        await writeConfig(containerIds);
    } else {
        window.showWarningMessage(messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_REMOVE);
        return;
    }

});