import { ConfigurationTarget, Uri } from 'vscode';

import {
  createConfigFile,
  getConfigFileDestination,
  isDockerrcDisabled as isDockerrcConfigDisabled,
  removeDockerrc,
  writeConfigToDockerrc
} from '../../common/config';
import { CONFIGURATION } from '../../common/constants';
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
