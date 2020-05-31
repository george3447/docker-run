import { ProgressLocation, window, commands } from "vscode";

import { getContainersList, ContainerList } from "../common/docker-utils";
import { ext } from "../core/ext-variables";

export const disposableStartAll = commands.registerCommand('docker-run.start:all', async () => {
    const progressOptions = { location: ProgressLocation.Notification, title: 'Starting All Containers' };

    window.withProgress(progressOptions, (async (progress) => {

        const containerList = await getContainersList(true).catch((error: Error) => {
            window.showWarningMessage(error.message);
            return [] as ContainerList;
        });

        await ext.startOperation.operateContainersWithProgress(containerList, progress);
    }));
});
