import { workspace, window, languages, commands, WorkspaceEdit, TextEdit } from "vscode";
import { posix } from "path";
import { existsSync } from "fs";

import { DEFAULT_FILE_NAME, ID_SEPARATOR, ID_SEPARATOR_ID_INDEX } from "./constants";

function getFileUri() {
    if (!workspace.workspaceFolders) {
        window.showInformationMessage('No folder or workspace opened');
        return;
    }

    const folderUri = workspace.workspaceFolders[0].uri;
    const fileUri = folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });
    return existsSync(fileUri.fsPath) ? fileUri : null;
}

export function isConfigAvailable() {
    return !!getFileUri();
}

export async function getConfig() {

    const fileUri = getFileUri();

    if (!fileUri) {
        throw new Error(`No ${DEFAULT_FILE_NAME} provided`);
    }

    const readData = await workspace.fs.readFile(fileUri);
    const config = JSON.parse(Buffer.from(readData).toString('utf8'));

    if (!config || !config.containers) {
        return window.showInformationMessage('No container names provided');
    }
    return config;
}

export async function writeConfig(containerLabels: Array<string>) {
    if (!workspace.workspaceFolders) {
        return window.showInformationMessage('No folder or workspace opened');
    }

    const containerIds = containerLabels.map(containerLabel => containerLabel.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
    const containers = containerIds;

    const writeStr = JSON.stringify({ containers });
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
