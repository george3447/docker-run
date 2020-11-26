import { commands, window } from "vscode";

import { getGlobalContainers, getWorkspaceContainers, ContainerList, extractContainerIds } from "../common/list";
import { writeConfig } from "../common/config";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";
import * as messages from '../common/messages';

export const disposableAdd = commands.registerCommand('docker-run.add', async (createConfigFile?: boolean) => {

    let quickPickList: ContainerList;
    let containersToExtract: ContainerList = [];

    const availableContainerList = await getGlobalContainers(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!availableContainerList.length) {
        window.showWarningMessage(messages.NO_CONTAINERS_FOUND);
        return;
    }

    if (!createConfigFile) {
        const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        const newContainers = availableContainerList.filter(availableContainer =>
            !containerList.map(container => container.containerId)
                .includes(availableContainer.containerId));

        if (!newContainers.length) {
            window.showWarningMessage(messages.ALREADY_ADDED_TO_WORKSPACE);
            return;
        }

        quickPickList = newContainers;
        containersToExtract = containerList;
    } else {
        quickPickList = availableContainerList;
    }

    const selection = await window.showQuickPick(quickPickList, {
        canPickMany: true,
        placeHolder: messages.SELECT_CONTAINERS
    });

    if (selection && selection.length > 0) {
        const containerIds = extractContainerIds([...containersToExtract, ...selection]);
        await writeConfig(containerIds);
        await ext.startOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_ADD);
        return;
    }
});