import * as Dockerode from 'dockerode';
import { DockerOptions } from 'dockerode';
import { commands, ConfigurationTarget, window } from 'vscode';

import { AutoAdd, autoAddList, ConfigTarget, configTargetList, CONFIGURATION } from '../common/constants';
import { AutoGenerateConfigDisabledError, AutoStopNonRelatedDisabledError } from '../common/error';
import * as messages from '../common/messages';
import { isSettingsDisabled, updateSettings } from '../common/settings';
import { createStatusBarItem, initStatusBarItemRefreshTimer } from '../common/status-bar';
import { ext } from './ext-variables';
import { StartOperation, StopNonRelatedOperation, StopOperation } from './operations';

export function initDockerode(options?: DockerOptions) {
  ext.dockerode = new Dockerode(options);
}

export function initContainerOperations() {
  ext.startOperation = new StartOperation();
  ext.stopOperation = new StopOperation();
  ext.stopNonRelatedOperation = new StopNonRelatedOperation();
}

export async function initStatusBarItem() {
  if (!isSettingsDisabled(CONFIGURATION.DISABLE_STATUS_BAR_ITEM)) {
    await createStatusBarItem();
    initStatusBarItemRefreshTimer();
  }
}

export async function initAutoAdd() {
  if (isSettingsDisabled(CONFIGURATION.DISABLE_AUTO_GENERATE_CONFIG)) {
    throw new AutoGenerateConfigDisabledError('Disabled auto generation of file');
  }

  const selection = await window.showQuickPick(autoAddList, {
    placeHolder: messages.ADD_CONTAINERS_FOR_WORKSPACE
  });

  if (selection && selection.id) {
    switch (selection.id) {
      case AutoAdd.YES:
        await initConfigTarget();
        break;
      case AutoAdd.SKIP_WORK_SPACE:
      case AutoAdd.SKIP_GLOBAL:
        await updateSettings(
          CONFIGURATION.DISABLE_AUTO_GENERATE_CONFIG,
          true,
          selection.id === AutoAdd.SKIP_GLOBAL ? ConfigurationTarget.Global : ConfigurationTarget.Workspace
        );
        break;
      case AutoAdd.No:
        break;
    }
  }
}

export async function initConfigTarget() {
  const selection = await window.showQuickPick(configTargetList, {
    placeHolder: `Where do you want to save the container ids`
  });

  if (selection) {
    if (selection.id === ConfigTarget.Settings) {
      await updateSettings(CONFIGURATION.DISABLE_DOCKERRC, true, ConfigurationTarget.Workspace);
    }
    await commands.executeCommand('docker-run.add', true);
  }
}

export async function initAutoStart() {
  await commands.executeCommand('docker-run.start:all');

  if (isSettingsDisabled(CONFIGURATION.DISABLE_AUTO_STOP_NON_RELATED)) {
    throw new AutoStopNonRelatedDisabledError('Disabled auto stopping of non related containers');
  }

  await commands.executeCommand('docker-run.stop:non-related');
}
