import { workspace, window, languages, commands, WorkspaceEdit, TextEdit, ConfigurationTarget } from "vscode";
import { posix } from "path";
import { existsSync } from "fs";

import { DEFAULT_FILE_NAME, CONFIGURATION } from "./constants";
import { DockerrcNotFoundError, EmptyConfigFileError, EmptyConfigArrayError, NoFolderOrWorkspaceOpenedError } from "./error";
import * as messages from '../common/messages';
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
        const containers = getConfiguration(CONFIGURATION.CONTAINERS);
        return containers !== null;
    }
    return !!getFileUri();
}

export async function getConfig() {

    let containers;
    if (isDockerrcDisabled()) {
        containers = getConfiguration(CONFIGURATION.CONTAINERS);
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

async function writeConfigToDockerrc(containerIds: Array<string>) {

    if (!workspace.workspaceFolders) {
        return window.showInformationMessage(messages.NO_FOLDER_OR_WORKSPACE_OPENED);
    }

    const writeStr = JSON.stringify({ containers: containerIds });
    const writeData = Buffer.from(writeStr, 'utf8');
    const folderUri = workspace.workspaceFolders[0].uri;
    const fileUri = folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });
    await workspace.fs.writeFile(fileUri, writeData);

    const textEditor = await window.showTextDocument(fileUri);
    const { document, options } = textEditor;
    await languages.setTextDocumentLanguage(document, 'json');

    const { uri } = document;
    const formatted = await commands.executeCommand('vscode.executeFormatDocumentProvider', uri, options);
    const workEdits = new WorkspaceEdit();
    workEdits.set(uri, formatted as Array<TextEdit>);
    await workspace.applyEdit(workEdits);
    await document.save();
}
