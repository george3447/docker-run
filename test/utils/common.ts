import { ConfigurationTarget, Uri } from 'vscode';

import { isDockerrcDisabled as isDockerrcConfigDisabled } from '../../src/common/config';
import { CONFIGURATION } from '../../src/common/constants';
import {
  createConfigFile,
  getConfigFileDestination,
  removeDockerrc,
  writeConfigToDockerrc
} from '../../src/common/file';
import { updateSettings } from '../../src/common/settings';

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
