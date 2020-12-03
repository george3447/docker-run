import { StatusBarAlignment, window } from 'vscode';
import { codicons as codeIcons } from 'vscode-ext-codicons';

import { ext } from '../core/ext-variables';
import { CONFIGURATION } from './constants';
import { getWorkspaceContainers } from './list';
import { getConfiguration } from './settings';

export function initStatusBarItemRefreshTimer() {
  clearStatusBarRefreshTimer();

  const statusBarItemRefreshInterval = getConfiguration<number>(CONFIGURATION.STATUS_BAR_ITEM_REFRESH_INTERVAL);

  ext.statusBarItemRefreshTimer = setInterval(async () => {
    await createStatusBarItem(true);
  }, statusBarItemRefreshInterval || 2000);
}

export function clearStatusBarRefreshTimer() {
  if (ext.statusBarItemRefreshTimer) {
    clearInterval(ext.statusBarItemRefreshTimer);
  }
}

export function disposeStatusBarItem() {
  if (ext.statusBarItem) {
    ext.statusBarItem.dispose();
  }
}

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

  for (let index = 0; index < containers.length; index++) {
    if (index > 0) {
      statusBartItemText += ' | ';
    }
    const isRunning = await isContainerRunning(containers[index].containerId);
    statusBartItemText += `${isRunning ? codeIcons.play : codeIcons.chrome_maximize} ${containers[index].label}`;
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
