import { commands, window } from 'vscode';

import { handleError } from '../common/error';
import { ContainerList, getGlobalContainers, getWorkspaceContainers } from '../common/list';
import * as messages from '../common/messages';
import { ext } from '../core/ext-variables';

export const disposableStopNonRelated = commands.registerCommand('docker-run.stop:non-related', async () => {
  const containerList = await getWorkspaceContainers(true).catch((error: Error) => {
    handleError(error);
    return [] as ContainerList;
  });

  const allContainers = await getGlobalContainers(false, true).catch((error: Error) => {
    handleError(error);
    return [] as ContainerList;
  });

  const nonRelatedContainers = allContainers.filter(
    (runningContainer) =>
      !containerList.map((container) => container.containerId).includes(runningContainer.containerId)
  );

  if (!nonRelatedContainers.length) {
    window.showWarningMessage(messages.NO_NON_RELATED_CONTAINER_FOUND);
    return;
  }

  await ext.stopNonRelatedOperation.operateContainers(nonRelatedContainers);
});
