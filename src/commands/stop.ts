import { ExtensionContext, commands, window, ProgressLocation } from "vscode";

import { getContainersList } from "../common/docker-utils";
import { ID_SEPARATOR, ID_SEPARATOR_ID_INDEX } from "../common/constants";
import { stopContainer, stopContainers } from "../common/stop-container";

export function registerStop(context: ExtensionContext) {

    let disposableStop = commands.registerCommand('docker-run.stop', async () => {

        const runningContainerList = await getContainersList(true).catch((error: Error) => {
            window.showWarningMessage(error.message);
            return;
        });;

        if (runningContainerList) {

            if (!runningContainerList.length) {
                return window.showInformationMessage(`No Running Containers Found`);
            }

            const selection = await window.showQuickPick(runningContainerList, { canPickMany: true, placeHolder: 'Select Container' });

            if (selection && selection.length > 0) {

                if (selection.length === 1) {

                    const [containerName, containerId] = selection[0].split(ID_SEPARATOR);
                    const progressOptions = { location: ProgressLocation.Notification, title: `Stopping Container ${containerName}` };

                    window.withProgress(progressOptions, (async () => {
                        await stopContainer(containerId);
                    }));

                } else {

                    const containerIds = selection.map(selectedContainer => selectedContainer.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
                    const progressOptions = { location: ProgressLocation.Notification, title: `Stopping Selected Containers` };

                    window.withProgress(progressOptions, (async (progress) => {
                        await stopContainers(containerIds, progress);
                    }));
                }
            }
        }
    });

    context.subscriptions.push(disposableStop);
}