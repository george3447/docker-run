import { StatusBarAlignment, window } from 'vscode';
import { codicons as codeIcons } from 'vscode-ext-codicons';

import { ext } from '../core/ext-variables';
import { ContainerListItem, getWorkspaceContainers } from './list';

export async function createStatusBarItem(isRefresh = false) {
  if (!ext.statusBarItem) {
    ext.statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
  }

  const statusBartItemText = await getStatusBarItemText();

  if (!isRefresh || ext.statusBarItem.text !== statusBartItemText) {
    ext.statusBarItem.text = statusBartItemText;
    ext.statusBarItem.tooltip = 'Click to see docker run commands';
    ext.statusBarItem.command = {
      title: 'Show Commands',
      command: 'workbench.action.quickOpen',
      arguments: ['> Docker Run:']
    };
    ext.statusBarItem.show();
  }
}

async function getStatusBarItemText() {
  let statusBartItemText = '';

  const containers = await getWorkspaceContainers(true, false, ['imageName']).catch(() => []);

  const sortedContainers = containers.sort((containerA: ContainerListItem, containerB: ContainerListItem) => {
    return containerA.label > containerB.label ? 1 : containerA.label < containerB.label ? -1 : 0;
  });

  for (let index = 0; index < sortedContainers.length; index++) {
    if (index > 0) {
      statusBartItemText += ' | ';
    }
    const isRunning = await isContainerRunning(sortedContainers[index].containerId);
    statusBartItemText += `${isRunning ? codeIcons.play : codeIcons.chrome_maximize} ${sortedContainers[index].label}`;
  }
  return statusBartItemText;
}

async function isContainerRunning(containerId: string) {
  const container = ext.dockerode.getContainer(containerId);
  const {
    State: { Running: running }
  } = await container.inspect();

  return running === true;
}
