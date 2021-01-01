import { Container } from 'dockerode';
import { Progress, ProgressLocation, ProgressOptions, window } from 'vscode';

import { ContainerList, ContainerListItem, isContainerExists } from '../../common/list';
import * as messages from '../../common/messages';
import { ext } from '../ext-variables';

export abstract class Operation {
  abstract getProgressTitleForSingleContainer(label: string): string;
  abstract getProgressTitleForMultipleContainers(isAll?: boolean): string;
  abstract operate(container: Container, label?: string): Promise<void>;

  async operateContainers(selection: ContainerList, isAll = false) {
    const progressOptions: ProgressOptions = { location: ProgressLocation.Notification };
    if (selection.length === 1) {
      const [containerListItem] = selection;
      progressOptions.title = this.getProgressTitleForSingleContainer(containerListItem.label);
      await window.withProgress(progressOptions, async () => {
        await this.operateContainer(containerListItem);
      });
    } else {
      progressOptions.title = this.getProgressTitleForMultipleContainers(isAll);
      await window.withProgress(progressOptions, async (progress) => {
        await this.operateContainersWithProgress(selection, progress);
      });
    }
  }

  async operateContainersWithProgress(
    containers: ContainerList,
    progress: Progress<{
      message?: string | undefined;
      increment?: number | undefined;
    }>
  ) {
    const containersLength = containers.length;

    progress.report({ message: `0/${containersLength}` });

    for (let i = 0; i < containersLength; i++) {
      progress.report({ message: `${i + 1}/${containersLength}` });

      await this.operateContainer(containers[i]);
    }
  }

  private async operateContainer(containerListItem: ContainerListItem) {
    const { containerId, label } = containerListItem;
    const isContainerExist = await isContainerExists(containerId);

    if (!isContainerExist) {
      window.showWarningMessage(messages.NO_CONTAINER_WITH_CONTAINER_ID_FOUND(containerId));
      return;
    }

    const container = ext.dockerode.getContainer(containerId);
    await this.operate(container, label);
  }
}
