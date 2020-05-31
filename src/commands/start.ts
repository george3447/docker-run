import { commands, window } from "vscode";

import { getContainersList } from "../common/docker-utils";
import { startContainersByLabels } from "../common/start-container";

export const disposableStart = commands.registerCommand('docker-run.start', async () => {

    const stoppedContainerList = await getContainersList(false, false).catch((error: Error) => {
        window.showWarningMessage(error.message);
        return;
    });

    if (stoppedContainerList) {
        if (!stoppedContainerList.length) {
            return window.showInformationMessage(`All Containers Are Running`);
        }

        const selection = await window.showQuickPick(stoppedContainerList, { canPickMany: true, placeHolder: 'Select Container' });

        if (selection && selection.length > 0) {

            await startContainersByLabels(selection);
        }
    }
});

