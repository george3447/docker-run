import { ExtensionContext, commands, window, ProgressLocation } from "vscode";

import { getContainersList } from "../common/docker-utils";
import { ID_SEPARATOR, ID_SEPARATOR_ID_INDEX } from "../common/constants";
import { startContainer, startContainers } from "../common/start-container";

export function registerStart(context: ExtensionContext) {

    let disposableStart = commands.registerCommand('docker-run.start', async () => {

        const stoppedContainerList = await getContainersList(false).catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });

        if (stoppedContainerList) {
            if (!stoppedContainerList.length) {
                return window.showInformationMessage(`All Containers Are Running`);
            }

            const selection = await window.showQuickPick(stoppedContainerList, { canPickMany: true, placeHolder: 'Select Container' });

            if (selection && selection.length > 0) {

                if (selection.length === 1) {

                    const [containerName, containerId] = selection[0].split(ID_SEPARATOR);
                    const progressOptions = { location: ProgressLocation.Notification, title: `Starting Container ${containerName}` };

                    window.withProgress(progressOptions, (async () => {
                        await startContainer(containerId);
                    }));

                } else {

                    const containerIds = selection.map(selectedContainer => selectedContainer.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
                    const progressOptions = { location: ProgressLocation.Notification, title: `Starting Selected Containers` };

                    window.withProgress(progressOptions, (async (progress) => {
                        await startContainers(containerIds, progress);
                    }));
                }
            }
        }
    });

    context.subscriptions.push(disposableStart);
}