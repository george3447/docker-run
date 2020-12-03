import { ContainerInspectInfo } from 'dockerode';
import { QuickPickItem } from 'vscode';

import { ext } from '../core/ext-variables';
import { getConfig } from './config';
import { defaultContainerLabelFormat, defaultContainerLabelFormatSymbols } from './constants';
import { EmptyConfigError, NoContainersFoundError } from './error';
import { ContainerLabelInfo } from './models';

export interface ContainerListItem extends QuickPickItem {
  containerId: string;
}

export type ContainerList = Array<ContainerListItem>;

export function extractContainerIds(containerList: ContainerList) {
  return containerList.map((containerListItem) => containerListItem.containerId);
}

export async function getWorkspaceContainers(
  isAll: boolean,
  isRunning?: boolean,
  labelFormat?: Array<keyof ContainerLabelInfo>
): Promise<ContainerList> {
  const containers: Array<string> = await getConfig().catch((error: EmptyConfigError) => {
    error.setFileName('list.ts');
    throw error;
  });
  return await mapContainersWithLabel(containers, isAll, isRunning, labelFormat);
}

export async function getGlobalContainers(isAll: boolean, isRunning?: boolean): Promise<ContainerList> {
  const containers = await ext.dockerode.listContainers({ all: true });
  if (!containers || !containers.length) {
    throw new NoContainersFoundError();
  }
  return mapContainersWithLabel(
    containers.map((container) => container.Id.substring(0, 12)),
    isAll,
    isRunning
  );
}

export async function isContainerExists(containerId: string): Promise<boolean> {
  const containers = await ext.dockerode.listContainers({ all: true });
  if (!containers || !containers.length) {
    return false;
  }
  return containers.findIndex((container) => container.Id.substring(0, 12) === containerId) > -1;
}

async function mapContainersWithLabel(
  containers: string[],
  isAll: boolean,
  isRunning?: boolean,
  labelFormat?: Array<keyof ContainerLabelInfo>
): Promise<ContainerList> {
  const containersList = [];
  for (let i = 0; i < containers.length; i++) {
    const containerId = containers[i];
    const isExists = await isContainerExists(containerId);
    if (isExists) {
      const container = ext.dockerode.getContainer(containerId);
      const containerInfo = await container.inspect();

      if (isAll || containerInfo.State.Running === isRunning) {
        const label = getContainerLabel(containerInfo, labelFormat);
        containersList.push({ label, containerId });
      }
    }
  }

  const sortedContainers = containersList.sort((containerA: ContainerListItem, containerB: ContainerListItem) => {
    return containerA.label > containerB.label ? 1 : containerA.label < containerB.label ? -1 : 0;
  });

  return sortedContainers;
}

function getContainerLabel(
  containerInfo: ContainerInspectInfo,
  labelFormat: Array<keyof ContainerLabelInfo> = defaultContainerLabelFormat
): string {
  const {
    Config: { Image: imageFullName }
  } = containerInfo;

  const [imageName, imageVersion] = imageFullName.split(':');
  const name = getFormattedName(containerInfo.Name);
  const containerLabelInfo: ContainerLabelInfo = {
    ...defaultContainerLabelFormatSymbols,
    name,
    imageName,
    imageVersion
  };

  return labelFormat.reduce((label: string, containerLabelInfoKey: keyof ContainerLabelInfo) => {
    return label + containerLabelInfo[containerLabelInfoKey];
  }, '');
}

function getFormattedName(name: string): string {
  return name[0] === '/' ? name.substring(1) : name;
}
