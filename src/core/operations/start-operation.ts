import { Container } from 'dockerode';
import { window } from 'vscode';

import * as messages from '../../common/messages';
import { Operation } from './operation';

export class StartOperation extends Operation {
  constructor() {
    super();
  }

  getProgressTitleForSingleContainer(label: string) {
    return messages.STARTING_CONTAINER(label);
  }

  getProgressTitleForMultipleContainers(isAll: boolean) {
    return isAll ? messages.STARTING_ALL_CONTAINERS : messages.STARTING_SELECTED_CONTAINERS;
  }

  async operate(container: Container, label: string) {
    const containerInfo = await container.inspect();
    const {
      State: { Running }
    } = containerInfo;

    if (Running === true) {
      window.showInformationMessage(messages.CONTAINER_ALREADY_RUNNING(label));
      return;
    }

    await container.start();
    window.showInformationMessage(messages.SUCCESSFULLY_STARTED_CONTAINER(label));
  }
}
