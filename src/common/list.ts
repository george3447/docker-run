import { QuickPickItem } from "vscode";
import { ContainerInspectInfo } from "dockerode";

import { getConfig } from './config';
import { ext } from '../core/ext-variables';
import { EmptyConfigError, NoContainersFoundError } from "./error";

export interface ContainerListItem extends QuickPickItem {
    containerId: string;
}

export type ContainerList = Array<ContainerListItem>;

export function extractContainerIds(containerList: ContainerList) {
    return containerList.map(containerListItem => containerListItem.containerId);
}

export async function getWorkspaceContainers(isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
    const containers: Array<string> = await getConfig().catch((error: EmptyConfigError) => {
        error.setFileName("Docker Utils");
        throw error;
    });
    return await mapContainersWithLabel(containers, isAll, isRunning);
}

export async function getGlobalContainers(isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
    const containers = await ext.dockerode.listContainers({ all: true });
    if (!containers || !containers.length) {
        throw new NoContainersFoundError();
    }
    return mapContainersWithLabel(containers.map(container => container.Id.substring(0, 12)), isAll, isRunning);
}

export async function isContainerExists(containerId: string): Promise<boolean> {
    const containers = await ext.dockerode.listContainers({ all: true });
    if (!containers || !containers.length) {
        return false;
    }
    return containers.findIndex(container => container.Id.substring(0, 12) === containerId) > -1;
}

async function mapContainersWithLabel(containers: string[], isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
    const containersList = [];
    for (let i = 0; i < containers.length; i++) {

        const containerId = containers[i];
        const isExists = await isContainerExists(containerId);
        if (isExists) {
            const container = ext.dockerode.getContainer(containerId);
            const containerInfo = await container.inspect();

            if (isAll || containerInfo.State.Running === isRunning) {
                const label = getContainerLabel(containerInfo);
                containersList.push({ label, containerId });
            }
        }
    }
    return containersList;
}

function getContainerLabel(containerInfo: ContainerInspectInfo): string {
    const containerName = getFormattedName(containerInfo.Name);
    const containerImage = containerInfo.Config.Image;
    return `${containerImage} (${containerName})`;
}

function getFormattedName(name: string): string {
    return name[0] === '/' ? name.substring(1) : name;
}