import { commands, window } from "vscode";

import { getContainersList } from "../common/docker-utils";
import { writeConfig } from "../common/config-utils";
import { stopContainersByLabels } from '../common/stop-container';

export const disposableRemove = commands.registerCommand('docker-run.remove', async () => {
    const containerList = await getContainersList(true).catch((error: Error) => {
        window.showWarningMessage(error.message);
        return [] as Array<string>;
    });

    if (!containerList.length) {
        return window.showInformationMessage(`Please Add At least One Container`);
    }

    const selection = await window.showQuickPick(containerList, {
        canPickMany: true,
        placeHolder: 'Select Containers You Need To Remove From This Workspace'
    });

    if (selection && selection.length > 0) {
        await writeConfig(containerList.filter(containerListItem => !selection.includes(containerListItem)));
        await stopContainersByLabels(selection);
    }

});