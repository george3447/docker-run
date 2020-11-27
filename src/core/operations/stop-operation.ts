import { Container } from 'dockerode';
import { window } from 'vscode';

import * as messages from '../../common/messages';
import { Operation } from './operation';

export class StopOperation extends Operation {
  constructor() {
    super();
  }

  getProgressTitleForSingleContainer(label: string) {
    return messages.STOPPING_CONTAINER(label);
  }

  getProgressTitleForMultipleContainers(isAll: boolean) {
    return isAll ? messages.STOPPING_ALL_CONTAINERS : messages.STOPPING_SELECTED_CONTAINERS;
  }

  async operate(container: Container, label: string) {
    const containerInfo = await container.inspect();
    const {
      State: { Running }
    } = containerInfo;

    if (Running === false) {
      return;
    }

    await container.stop();
    window.showInformationMessage(messages.SUCCESSFULLY_STOPPED_CONTAINER(label));
  }
}
