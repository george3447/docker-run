import { Progress, window, ProgressLocation } from "vscode";

import { ContainerList, ContainerListItem } from "./docker-utils";
import { ext } from "../core/ext-variables";

export enum OperationType {
    START = 'start',
    STOP = 'stop'
}

export interface OperationConfig {
    type: OperationType,
    message: {
        progress: string;
        status: string;
        result: string;
    }
}

export class ContainerOperation {

    private operationConfig: OperationConfig;

    constructor(operationConfig: OperationConfig) {
        this.operationConfig = operationConfig;
    }

    async operateContainers(selection: ContainerList) {
        const { message: { progress } } = this.operationConfig;
        if (selection.length === 1) {
            const [containerListItem] = selection;
            const progressOptions = { location: ProgressLocation.Notification, title: `${progress} Container ${containerListItem.label}` };
            window.withProgress(progressOptions, (async () => {
                await this.operateContainer(containerListItem);
            }));
        }
        else {
            const progressOptions = { location: ProgressLocation.Notification, title: `${progress} Selected Containers` };
            window.withProgress(progressOptions, (async (progress) => {
                await this.operateContainersWithProgress(selection, progress);
            }));
        }
    }

    async operateContainersWithProgress(containers: ContainerList, progress: Progress<{
        message?: string | undefined;
        increment?: number | undefined;
    }>) {

        const containersLength = containers.length;

        progress.report({ message: `0/${containersLength}` });

        for (let i = 0; i < containersLength; i++) {

            progress.report({ message: `${i + 1}/${containersLength}` });

            await this.operateContainer(containers[i]);
        }
    }

    async operateContainer(containerListItem: ContainerListItem) {

        const { type, message } = this.operationConfig;
        const { containerId, label } = containerListItem;
        const container = ext.dockerode.getContainer(containerId);

        if (!container) {
            window.showErrorMessage(`No Container With Given Container Id ${containerId} Found`);
            return;
        }

        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === (type === OperationType.START)) {
            window.showInformationMessage(`Container ${label} Already ${message.status}`);
            return;
        }

        await container[type]();
        window.showInformationMessage(`Successfully ${message.result} ${label}`);
    }
}