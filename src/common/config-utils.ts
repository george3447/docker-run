import { workspace, window } from "vscode";
import { posix } from "path";
import { existsSync } from "fs";

import { DEFAULT_FILE_NAME } from "./constants";

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
