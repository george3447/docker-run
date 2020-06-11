import { ProgressLocation, window, commands } from "vscode";

import { getContainersList, ContainerList, getAllContainersList } from "../common/list";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStopNonRelated = commands.registerCommand('docker-run.stop:non-related', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Stopping Non Related Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const containerList = await getContainersList(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        const allRunningContainer = await getAllContainersList(false, true);
        const nonRelatedContainers = allRunningContainer.filter(runningContainer =>
            !containerList.map(container => container.containerId)
                .includes(runningContainer.containerId));
        if (nonRelatedContainers.length) {
            ext.stopNonRelatedOperation.operateContainersWithProgress(nonRelatedContainers, progress);
        }
    }));
});
