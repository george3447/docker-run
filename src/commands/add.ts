import { commands, window } from "vscode";

import { getAllContainersList, getContainersList } from "../common/docker-utils";
import { writeConfig } from "../common/config-utils";
import { startContainersByLabels } from '../common/start-container';

export const disposableAdd = commands.registerCommand('docker-run.add', async (createConfigFile?: boolean) => {
    const availableContainerList = await getAllContainersList();

    if (!availableContainerList.length) {
        return window.showInformationMessage(`Not Containers Available`);
    }

    if (createConfigFile) {

        const selection = await window.showQuickPick(availableContainerList, {
            canPickMany: true,
            placeHolder: 'Select Containers That You Need For This Workspace'
        });

        if (selection && selection.length > 0) {
            await writeConfig(selection);
            await startContainersByLabels(selection);
        }

    } else {
        const containerList = await getContainersList(true).catch((error: Error) => {
            window.showWarningMessage(error.message);
            return [] as Array<string>;
        });

        const newContainers = availableContainerList.filter(availableContainer => !containerList.includes(availableContainer));

        if (!newContainers.length) {
            return window.showInformationMessage(`All Available Containers Are Already Added`);
        }

        const selection = await window.showQuickPick(newContainers, {
            canPickMany: true,
            placeHolder: 'Select Containers You Need For This Workspace'
        });

        if (selection && selection.length > 0) {
            await writeConfig([...containerList, ...selection]);
            await startContainersByLabels(selection);
        }
    }
});