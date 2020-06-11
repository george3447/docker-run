import { Progress, window, ProgressLocation } from "vscode";
import { Container } from "dockerode";

import { ContainerList, ContainerListItem } from "../../common/list";
import { ext } from "../ext-variables";

export interface OperationConfig {
    message: {
        progress: string;
        result: string;
    }
}

export abstract class Operation {

    private operationConfig: OperationConfig;

    constructor(operationConfig: OperationConfig) {
        this.operationConfig = operationConfig;
    }

    async abstract operate(container: Container, label?: string): Promise<void>;

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

        const { message } = this.operationConfig;
        const { containerId, label } = containerListItem;
        const container = ext.dockerode.getContainer(containerId);

        if (!container) {
            window.showErrorMessage(`No Container With Given Container Id ${containerId} Found`);
            return;
        }

        await this.operate(container, label);
        window.showInformationMessage(`Successfully ${message.result} ${label}`);
    }
}