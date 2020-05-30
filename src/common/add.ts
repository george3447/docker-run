import { window, workspace, languages, commands, WorkspaceEdit, TextEdit } from "vscode";
import { posix } from "path";

import { getAllContainersList } from "./docker-utils";
import { ID_SEPARATOR, DEFAULT_FILE_NAME, ID_SEPARATOR_ID_INDEX } from "./constants";

export async function add(createConfigFile = false) {

    const availableContainerList = await getAllContainersList();

    if (!availableContainerList.length) {
        return window.showInformationMessage(`All Containers Are Running`);
    }

    if (createConfigFile) {

        const selection = await window.showQuickPick(availableContainerList, {
            canPickMany: true,
            placeHolder: 'Select Containers You Need For This Workspace'
        });

        if (selection && selection.length > 0) {
            if (!workspace.workspaceFolders) {
                return window.showInformationMessage('No folder or workspace opened');
            }

            const containerIds = selection.map(selectedItem => selectedItem.split(ID_SEPARATOR)[ID_SEPARATOR_ID_INDEX]);
            const containers = containerIds;
            const writeStr = JSON.stringify({ containers });
            const writeData = Buffer.from(writeStr, 'utf8');
            const folderUri = workspace.workspaceFolders[0].uri;
            const fileUri = folderUri.with({ path: posix.join(folderUri.path, DEFAULT_FILE_NAME) });
            await workspace.fs.writeFile(fileUri, writeData);

            const textEditor = await window.showTextDocument(fileUri);
            await languages.setTextDocumentLanguage(textEditor.document, 'json');

            const formatted = await commands.executeCommand('vscode.executeFormatDocumentProvider', textEditor.document.uri);
            const workEdits = new WorkspaceEdit();
            workEdits.set(textEditor.document.uri, formatted as Array<TextEdit>); // give the edits
            await workspace.applyEdit(workEdits);
            await textEditor.document.save(); // apply the edits
        }
    } else {
        
    }


}