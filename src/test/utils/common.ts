import { ConfigurationTarget } from 'vscode';

import { isDockerrcDisabled as isDockerrcConfigDisabled, writeConfigToDockerrc } from '../../common/config';
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
