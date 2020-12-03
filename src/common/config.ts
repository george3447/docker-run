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
  TextEditorOptions,
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
    containers = getConfiguration<Array<string>>(CONFIGURATION.CONTAINERS);
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
    await updateSettings(CONFIGURATION.CONTAINERS, containerIds, ConfigurationTarget.Workspace);
  } else {
    await writeConfigToDockerrc(containerIds);
  }
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

export async function writeConfigToDockerrc(containerIds: Array<string>) {
  if (!workspace.workspaceFolders) {
    return window.showInformationMessage(messages.NO_FOLDER_OR_WORKSPACE_OPENED);
  }

  const folderUri = workspace.workspaceFolders[0].uri;
  const fileUri = folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });

  if (!getFileUri()) {
    const writeData = Buffer.from('', 'utf8');
    await workspace.fs.writeFile(fileUri, writeData);
  }

  const document = await workspace.openTextDocument(fileUri);
  const textEditor = await window.showTextDocument(fileUri);

  const writeStr = JSON.stringify({ containers: containerIds });
  let textEdit;

  if (document.lineCount > 0) {
    const startOfFile = document.lineAt(0).range.start;
    const endOfFile = document.lineAt(document.lineCount - 1).range.end;
    const replaceRange = new Range(startOfFile, endOfFile);
    textEdit = TextEdit.replace(replaceRange, writeStr);
  } else {
    const startingPosition = new Position(0, 0);
    textEdit = TextEdit.insert(startingPosition, writeStr);
  }

  const workEdits = new WorkspaceEdit();
  workEdits.set(document.uri, [textEdit] as Array<TextEdit>);
  await workspace.applyEdit(workEdits);
  await formatAndSaveDockerrc(document, textEditor.options);
}

export async function removeDockerrc() {
  const fileUri = getFileUri();
  if (fileUri) {
    await workspace.fs.delete(fileUri);
  }
}

async function formatAndSaveDockerrc(document: TextDocument, options: TextEditorOptions) {
  await languages.setTextDocumentLanguage(document, 'json');

  const { uri } = document;
  const formatted = await commands.executeCommand('vscode.executeFormatDocumentProvider', uri, options);
  const formattedEdits = new WorkspaceEdit();

  formattedEdits.set(uri, formatted as Array<TextEdit>);

  await workspace.applyEdit(formattedEdits);
  await document.save();
}
