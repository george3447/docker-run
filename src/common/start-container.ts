import { window, Progress } from "vscode";
import { Container } from "dockerode";

import { getContainerLabel } from "./docker-utils";
import { ext } from "../core/ext-variables";

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