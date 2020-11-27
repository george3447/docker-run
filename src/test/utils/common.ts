import { ConfigurationTarget, Uri, workspace } from 'vscode';
import path = require('path');

import { isDockerrcDisabled as isDockerrcConfigDisabled } from '../../common/config';
import { CONFIGURATION, DEFAULT_FILE_NAME } from '../../common/constants';
import { updateSettings } from '../../common/settings';

const testConfigFilePath = path.resolve(__dirname, `../../../src/test/workspace-v1/${DEFAULT_FILE_NAME}`);

const getFileURI = () => {
  return Uri.file(testConfigFilePath);
};

export const isDockerrcDisabled = () => {
  return isDockerrcConfigDisabled();
};

export const clearDockerrc = async () => {
  if (isDockerrcDisabled()) {
    return;
  }
  const fileUri = getFileURI();
  await workspace.fs.delete(fileUri);
  await sleep();
};

export const setEmptyDockerrc = async () => {
  if (isDockerrcDisabled()) {
    await updateSettings(CONFIGURATION.CONTAINERS, [], ConfigurationTarget.Workspace);
    return;
  }
  const writeData = Buffer.from('', 'utf8');
  await workspace.fs.writeFile(getFileURI(), writeData);
  await sleep();
};

function sleep(timeOut = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeOut);
  });
}
