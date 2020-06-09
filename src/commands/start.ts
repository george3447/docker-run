import { commands, window } from "vscode";

import { getContainersList } from "../common/docker";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStart = commands.registerCommand('docker-run.start', async () => {

    const stoppedContainerList = await getContainersList(false, false).catch((error: Error) => {
        handleError(error);
        return;
    });

    if (stoppedContainerList) {
        if (!stoppedContainerList.length) {
            return window.showInformationMessage(`All Containers Are Running`);
        }

        const selection = await window.showQuickPick(stoppedContainerList, { canPickMany: true, placeHolder: 'Select Container' });

        if (selection && selection.length > 0) {

            await ext.startOperation.operateContainers(selection);
        }
    }
});

