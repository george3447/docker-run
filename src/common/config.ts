import { existsSync } from 'fs';
import { posix } from 'path';
import {
  commands,
  ConfigurationTarget,
  languages,
  Position,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
  WorkspaceEdit
} from 'vscode';

import * as messages from '../common/messages';
import { CONFIGURATION, DEFAULT_FILE_NAME } from './constants';
import {
  DockerrcNotFoundError,
  EmptyConfigArrayError,
  EmptyConfigFileError,
  NoFolderOrWorkspaceOpenedError
} from './error';
import { getConfiguration, isSettingsDisabled, updateSettings } from './settings';

export const isDockerrcDisabled = () => {
  return isSettingsDisabled(CONFIGURATION.DISABLE_DOCKERRC);
};

export function getFileUri() {
  if (!workspace.workspaceFolders) {
    throw new NoFolderOrWorkspaceOpenedError();
  }

  const folderUri = workspace.workspaceFolders[0].uri;
  const fileUri = folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });
  return existsSync(fileUri.fsPath) ? fileUri : null;
}

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

export async function writeConfig(containerIds: Array<string>) {
  if (isDockerrcDisabled()) {
    await writeConfigToSettings(containerIds);
  } else {
    await writeConfigToDockerrc(containerIds);
  }
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

function getConfigurationFromSettings() {
  return getConfiguration<Array<string>>(CONFIGURATION.CONTAINERS);
}

async function getConfigFromDockerrc() {
  const fileUri = getFileUri();

  if (!fileUri) {
    throw new DockerrcNotFoundError();
  }

  const readData = await workspace.fs.readFile(fileUri);
  const stringData = Buffer.from(readData).toString('utf8');
  if (!stringData) {
    throw new EmptyConfigFileError();
  }
  const config = JSON.parse(stringData);

  if (!config || !config.containers) {
    return [];
  }
  return config.containers;
}

async function writeConfigToSettings(containerIds: Array<string>) {
  await updateSettings(CONFIGURATION.CONTAINERS, containerIds, ConfigurationTarget.Workspace);
}

export async function writeConfigToDockerrc(containerIds: Array<string>) {
  const fileUri = getConfigFileDestination();

  if (!fileUri) {
    return window.showInformationMessage(messages.NO_FOLDER_OR_WORKSPACE_OPENED);
  }

  const containerIdsAsString = JSON.stringify({ containers: containerIds });

  let isConfigCreated = false;

  if (!getFileUri()) {
    await createConfigFile(containerIdsAsString, fileUri);
    isConfigCreated = true;
  }

  const document = await workspace.openTextDocument(fileUri);

  if (!isConfigCreated) {
    const workEdits = new WorkspaceEdit();

    if (document.lineCount > 0) {
      const startOfFile = document.lineAt(0).range.start;
      const endOfFile = document.lineAt(document.lineCount - 1).range.end;
      const replaceRange = new Range(startOfFile, endOfFile);
      workEdits.replace(document.uri, replaceRange, containerIdsAsString);
    } else {
      const startingPosition = new Position(0, 0);
      workEdits.insert(document.uri, startingPosition, containerIdsAsString);
    }

    await workspace.applyEdit(workEdits);
    await document.save();
  }
  await formatAndSaveDockerrc(document);
}

export async function createConfigFile(content: string, fileUri: Uri) {
  const writeData = Buffer.from(content, 'utf8');
  await workspace.fs.writeFile(fileUri, writeData);
}

export function getConfigFileDestination() {
  if (workspace.workspaceFolders && workspace.workspaceFolders.length > 0) {
    const folderUri = workspace.workspaceFolders[0].uri;
    return folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });
  }
}

export async function removeDockerrc() {
  const fileUri = getFileUri();
  if (fileUri) {
    await workspace.fs.delete(fileUri);
  }
}

async function formatAndSaveDockerrc(document: TextDocument) {
  await languages.setTextDocumentLanguage(document, 'json');
  await document.save();

  const { uri } = document;
  const textEditor = await window.showTextDocument(uri);
  const formatted = await commands.executeCommand('vscode.executeFormatDocumentProvider', uri, textEditor.options);
  const formattedEdits = new WorkspaceEdit();

  formattedEdits.set(uri, formatted as Array<TextEdit>);

  await workspace.applyEdit(formattedEdits);
  await document.save();
}
