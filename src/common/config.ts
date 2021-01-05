import { ConfigurationTarget } from 'vscode';

import { CONFIGURATION } from './constants';
import { EmptyConfigArrayError } from './error';
import { getConfigFromDockerrc, getFileUri, removeDockerrc, writeConfigToDockerrc } from './file';
import { getConfiguration, isSettingsDisabled, updateSettings } from './settings';

function getConfigurationFromSettings() {
  return getConfiguration<Array<string>>(CONFIGURATION.CONTAINERS);
}

async function writeConfigToSettings(containerIds: Array<string>) {
  await updateSettings(CONFIGURATION.CONTAINERS, containerIds, ConfigurationTarget.Workspace);
}

export const isDockerrcDisabled = () => {
  return isSettingsDisabled(CONFIGURATION.DISABLE_DOCKERRC);
};

export function isConfigAvailable() {
  if (isDockerrcDisabled()) {
    const containers = getConfiguration<Array<string>>(CONFIGURATION.CONTAINERS);
    return containers !== null;
  }
  return !!getFileUri();
}

export async function getConfig() {
  let containers;
  if (isDockerrcDisabled()) {
    containers = getConfigurationFromSettings();
  } else {
    containers = await getConfigFromDockerrc();
  }

  if (!containers.length) {
    throw new EmptyConfigArrayError();
  }

  return containers;
}

export async function moveToDockerrc() {
  const containersFromSettings = getConfigurationFromSettings();
  if (containersFromSettings && containersFromSettings.length > 0) {
    await writeConfigToDockerrc(containersFromSettings);
    await writeConfigToSettings([]);
  }
}

export async function moveToSettings() {
  const containersFromDockerrc = await getConfigFromDockerrc();
  if (containersFromDockerrc && containersFromDockerrc.length > 0) {
    await writeConfigToSettings(containersFromDockerrc);
    await removeDockerrc();
  }
}

export async function writeConfig(containerIds: Array<string>) {
  if (isDockerrcDisabled()) {
    await writeConfigToSettings(containerIds);
  } else {
    await writeConfigToDockerrc(containerIds);
  }
}
