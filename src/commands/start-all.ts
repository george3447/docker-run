import { ProgressLocation, window, commands } from "vscode";

import { getContainersList, ContainerList } from "../common/docker";
import { ext } from "../core/ext-variables";
import { handleError } from "../common/error";

export const disposableStartAll = commands.registerCommand('docker-run.start:all', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Starting All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const containerList = await getContainersList(true).catch((error: Error) => {
            handleError(error);
            return [] as ContainerList;
        });

        await ext.startOperation.operateContainersWithProgress(containerList, progress);
    }));
});
