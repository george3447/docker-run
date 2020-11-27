import { commands, window } from 'vscode';

import { handleError } from '../common/error';
import { ContainerList, getWorkspaceContainers } from '../common/list';
import * as messages from '../common/messages';
import { ext } from '../core/ext-variables';

export const disposableStartAll = commands.registerCommand('docker-run.start:all', async () => {
  const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
    handleError(error);
    return [] as ContainerList;
  });

  if (!containerList.length) {
    window.showWarningMessage(messages.NO_CONTAINERS_FOUND_FOR_THIS_WORKSPACE);
    return;
  }

  await ext.startOperation.operateContainers(containerList, true);
});
