import { Progress, window } from "vscode";

import { getContainerLabel } from "./docker-utils";
import { ext } from "../core/ext-variables";

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