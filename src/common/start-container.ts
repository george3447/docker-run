import { window, Progress, ProgressLocation } from "vscode";

import { getContainerLabel } from "./docker-utils";
import { ext } from "../core/ext-variables";
import { ID_SEPARATOR, ID_SEPARATOR_ID_INDEX } from "./constants";

export async function startContainersByLabels(selection: string[]) {
    if (selection.length === 1) {
        const [containerName, containerId] = selection[0].split(ID_SEPARATOR);
        const progressOptions = { location: ProgressLocation.Notification, title: `Starting Container ${containerName}` };
        window.withProgress(progressOptions, (async () => {
            await startContainer(containerId);
        }));
    }
    else {
        const containerIds = selection.map(selectedContainer => selectedContainer.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
        const progressOptions = { location: ProgressLocation.Notification, title: `Starting Selected Containers` };
        window.withProgress(progressOptions, (async (progress) => {
            await startContainers(containerIds, progress);
        }));
    }
}


export async function startContainers(containers: Array<string>, progress: Progress<{
    message?: string | undefined;
    increment?: number | undefined;
}>) {

    const containersLength = containers.length;

    progress.report({ message: `0/${containersLength}` });

    for (let i = 0; i < containersLength; i++) {

        progress.report({ message: `${i + 1}/${containersLength}` });

        await startContainer(containers[i]);
    }
}

export async function startContainer(containerId: string) {

    const container = ext.dockerode.getContainer(containerId);

    if (!container) {
        window.showErrorMessage(`No Container With Given Container Id ${containerId} found`);
        return;
    }

    const containerInfo = await container.inspect();
    const containerLabel = getContainerLabel(containerInfo);

    const { State: { Running } } = containerInfo;

    if (Running) {
        window.showInformationMessage(`Container ${containerLabel} Already Running`);
        return;
    }

    await container.start();
    window.showInformationMessage(`Successfully Started ${containerLabel}`);
}