import { ContainerInspectInfo } from "dockerode";

import { ID_SEPARATOR } from "./constants";
import { getConfig } from './config-utils';
import { ext } from '../core/ext-variables';
import { window } from "vscode";

async function getContainerLabels(containers: string[], isAll: boolean, isRunning?: boolean) {
    const containersList = [];
    for (let i = 0; i < containers.length; i++) {
        const containerId = containers[i];
        const container = ext.dockerode.getContainer(containerId);
        const containerInfo = await container.inspect();
        if (isAll || containerInfo.State.Running === isRunning) {
            const containerLabel = getContainerLabel(containerInfo);
            containersList.push(`${containerLabel}${ID_SEPARATOR}${containerId}`);
        }
    }
    return containersList;
}

export function getFormattedName(name: string): string {
    return name[0] === '/' ? name.substring(1) : name;
}

export function getContainerLabel(containerInfo: ContainerInspectInfo): string {
    const containerName = getFormattedName(containerInfo.Name);
    const containerImage = containerInfo.Config.Image;
    return `${containerImage} (${containerName})`;
}

export async function getContainersList(isRunning: boolean, ) {
    const { containers }: { containers: Array<string> } = await getConfig().catch((error: Error) => {
        throw error;
    });
    return await getContainerLabels(containers, false, isRunning);
}

export async function getAllContainersList() {
    const containers = await ext.dockerode.listContainers({ all: true });
    if (!containers) {
        return [];
    }
    return getContainerLabels(containers.map(container => container.Id.substring(0, 12)), true);
}