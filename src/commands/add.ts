import { commands, window } from "vscode";

import { getAllContainersList, getContainersList, ContainerList, extractContainerIds } from "../common/list";
import { writeConfig } from "../common/config";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableAdd = commands.registerCommand('docker-run.add', async (createConfigFile?: boolean) => {

    let quickPickList: ContainerList;
    let containersToExtract: ContainerList = [];

    const availableContainerList = await getAllContainersList(true).catch((error: Error) => {
        handleError(error);
        return [] as ContainerList;
    });

    if (!availableContainerList.length) {
        window.showWarningMessage(`No Containers Found`);
        return;
    }

    if (!createConfigFile) {
        const containerList = await getContainersList(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        const newContainers = availableContainerList.filter(availableContainer =>
            !containerList.map(container => container.containerId)
                .includes(availableContainer.containerId));

        if (!newContainers.length) {
            window.showWarningMessage(`All Available Containers Are Already Added To Workspace`);
            return;
        }

        quickPickList = newContainers;
        containersToExtract = containerList;
    } else {
        quickPickList = availableContainerList;
    }

    const selection = await window.showQuickPick(quickPickList, {
        canPickMany: true,
        placeHolder: 'Select Containers That You Need For This Workspace'
    });

    if (selection && selection.length > 0) {
        const containerIds = extractContainerIds([...containersToExtract, ...selection]);
        await writeConfig(containerIds);
        await ext.startOperation.operateContainers(selection);
    } else {
        window.showWarningMessage(`Please Select At least One Container To Add`);
        return;
    }
});