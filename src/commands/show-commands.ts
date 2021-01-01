import { commands, window } from 'vscode';

import { COMMANDS, dockerRunCommandList } from '../common/constants';
import { ContainerList, getGlobalContainers, getWorkspaceContainers } from '../common/list';
import * as messages from '../common/messages';
import { DockerRunCommandList } from '../common/models';

export const disposableShowCommand = commands.registerCommand('docker-run.show-commands', async () => {
  const availableCommandList = await getAvailableCommandList(dockerRunCommandList);

  const selectedCommand = await window.showQuickPick(availableCommandList, {
    canPickMany: false,
    placeHolder: messages.DOCKER_RUN_COMMANDS
  });

  if (selectedCommand && selectedCommand.id) {
    commands.executeCommand(selectedCommand.id);
  }
});

async function getAvailableCommandList(commands: DockerRunCommandList) {
  const availableCommandList = [];
  for (let index = 0; index < commands.length; index++) {
    const command = commands[index];
    let isAllowed = false;
    switch (command.id) {
      case COMMANDS.ADD:
        isAllowed = await isAddCommandAvailable();
        break;
      case COMMANDS.REMOVE:
        isAllowed = await isRemoveCommandAvailable();
        break;
      case COMMANDS.START:
        isAllowed = await isStartCommandAvailable();
        break;
      case COMMANDS.START_ALL:
        isAllowed = await isStartAllCommandAvailable();
        break;
      case COMMANDS.STOP:
        isAllowed = await isStopCommandAvailable();
        break;
      case COMMANDS.STOP_ALL:
        isAllowed = await isStopAllCommandAvailable();
        break;
      case COMMANDS.STOP_NON_RELATED:
        isAllowed = await isStopNonRelatedCommandAvailable();
        break;
    }
    if (isAllowed) {
      availableCommandList.push(command);
    }
  }

  return availableCommandList;
}

async function isAddCommandAvailable() {
  const availableContainerList = await getGlobalContainers(true).catch(() => {
    return [] as ContainerList;
  });

  if (!availableContainerList.length) {
    return false;
  }

  const containerList = await getWorkspaceContainers(true).catch(() => {
    return [] as ContainerList;
  });

  const newContainers = availableContainerList.filter(
    (availableContainer) =>
      !containerList.map((container) => container.containerId).includes(availableContainer.containerId)
  );

  return !!newContainers.length;
}

async function isRemoveCommandAvailable() {
  const containerList = await getWorkspaceContainers(true).catch(() => {
    return [] as ContainerList;
  });

  return !!containerList.length;
}

async function isStartCommandAvailable() {
  const stoppedContainerList = await getWorkspaceContainers(false, false).catch(() => {
    return [];
  });

  return !!stoppedContainerList.length;
}

async function isStartAllCommandAvailable() {
  const containerList = await getWorkspaceContainers(true).catch(() => {
    return [] as ContainerList;
  });

  if (!containerList.length) {
    return false;
  }

  const runningContainerList = await getWorkspaceContainers(false, true).catch(() => {
    return [] as ContainerList;
  });

  return !(containerList.length === runningContainerList.length);
}

async function isStopCommandAvailable() {
  const runningContainerList = await getWorkspaceContainers(false, true).catch(() => {
    return [];
  });

  return !!runningContainerList.length;
}

async function isStopAllCommandAvailable() {
  const containerList = await getWorkspaceContainers(true).catch(() => {
    return [] as ContainerList;
  });

  if (!containerList.length) {
    return false;
  }

  const stoppedContainerList = await getWorkspaceContainers(false, false).catch(() => {
    return [] as ContainerList;
  });

  return !(containerList.length === stoppedContainerList.length);
}

async function isStopNonRelatedCommandAvailable() {
  const containerList = await getWorkspaceContainers(true).catch(() => {
    return [] as ContainerList;
  });

  const allContainers = await getGlobalContainers(false, true).catch(() => {
    return [] as ContainerList;
  });

  const nonRelatedContainers = allContainers.filter(
    (runningContainer) =>
      !containerList.map((container) => container.containerId).includes(runningContainer.containerId)
  );

  return !!nonRelatedContainers.length;
}
