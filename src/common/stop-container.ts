import { Progress, window, ProgressLocation } from "vscode";

import { getContainerLabel } from "./docker-utils";
import { ext } from "../core/ext-variables";
import { ID_SEPARATOR, ID_SEPARATOR_ID_INDEX } from "./constants";

export async function stopContainersByLabels(selection: string[]) {
    if (selection.length === 1) {
        const [containerName, containerId] = selection[0].split(ID_SEPARATOR);
        const progressOptions = { location: ProgressLocation.Notification, title: `Stopping Container ${containerName}` };
        window.withProgress(progressOptions, (async () => {
            await stopContainer(containerId);
        }));
    }
    else {
        const containerIds = selection.map(selectedContainer => selectedContainer.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
        const progressOptions = { location: ProgressLocation.Notification, title: `Stopping Selected Containers` };
        window.withProgress(progressOptions, (async (progress) => {
            await stopContainers(containerIds, progress);
        }));
    }
}


export async function stopContainers(containers: Array<string>, progress: Progress<{
    message?: string | undefined;
    increment?: number | undefined;
}>) {

    const containersLength = containers.length;

    progress.report({ message: `0/${containersLength}` });

    for (let i = 0; i < containersLength; i++) {

        progress.report({ message: `${i + 1}/${containersLength}` });

        await stopContainer(containers[i]);
    }
}

export async function stopContainer(containerId: string) {

    const container = ext.dockerode.getContainer(containerId);

    if (!container) {
        window.showErrorMessage(`No Container With Given Container Id ${containerId} found`);
        return;
    }

    const containerInfo = await container.inspect();
    const containerLabel = getContainerLabel(containerInfo);
    const { State: { Running } } = containerInfo;

    if (!Running) {
        window.showInformationMessage(`Container ${containerLabel} Already Stopped`);
        return;
    }

    await container.stop();
    window.showInformationMessage(`Successfully Stopped ${containerLabel}`);
}