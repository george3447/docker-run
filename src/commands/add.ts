import { commands, window } from "vscode";

import { getAllContainersList, getContainersList, ContainerList, extractContainerIds } from "../common/docker-utils";
import { writeConfig } from "../common/config-utils";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error-utils";

export const disposableAdd = commands.registerCommand('docker-run.add', async (createConfigFile?: boolean) => {
    const availableContainerList = await getAllContainersList(true);

    if (!availableContainerList.length) {
        return window.showInformationMessage(`Not Containers Available`);
    }

    if (createConfigFile) {

        const selection = await window.showQuickPick(availableContainerList, {
            canPickMany: true,
            placeHolder: 'Select Containers That You Need For This Workspace'
        });

        if (selection && selection.length > 0) {
            const containerIds = extractContainerIds(selection);
            await writeConfig(containerIds);
            await ext.startOperation.operateContainers(selection);
        }

    } else {
        const containerList = await getContainersList(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        const newContainers = availableContainerList.filter(availableContainer =>
            !containerList.map(container => container.containerId)
                .includes(availableContainer.containerId));

        if (!newContainers.length) {
            return window.showInformationMessage(`All Available Containers Are Already Added`);
        }

        const selection = await window.showQuickPick(newContainers, {
            canPickMany: true,
            placeHolder: 'Select Containers You Need For This Workspace'
        });

        if (selection && selection.length > 0) {
            const containerIds = extractContainerIds([...containerList, ...selection]);
            await writeConfig(containerIds);
            await ext.startOperation.operateContainers(selection);
        }
    }
});