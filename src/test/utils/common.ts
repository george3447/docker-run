import { ConfigurationTarget, Uri } from 'vscode';

import { isDockerrcDisabled as isDockerrcConfigDisabled } from '../../common/config';
import { CONFIGURATION } from '../../common/constants';
import { createConfigFile, getConfigFileDestination, removeDockerrc, writeConfigToDockerrc } from '../../common/file';
import { updateSettings } from '../../common/settings';

export const isDockerrcDisabled = () => {
  return isDockerrcConfigDisabled();
};

export const setEmptyDockerrc = async () => {
  if (isDockerrcDisabled()) {
    await updateSettings(CONFIGURATION.CONTAINERS, [], ConfigurationTarget.Workspace);
    return;
  }
  await writeConfigToDockerrc([]);
};

export const createDockerrcFile = async () => {
  await createConfigFile('', getConfigFileDestination() as Uri);
};

export const removeDockerrcFile = async () => {
  await removeDockerrc();
};
