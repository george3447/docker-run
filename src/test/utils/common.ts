import { Uri, workspace } from "vscode";
import path = require("path");

import { DEFAULT_FILE_NAME } from "../../common/constants";

export const testConfigFilePath = path.resolve(__dirname, `../../../src/test/workspace/${DEFAULT_FILE_NAME}`);

export const getFileURI = () => {
	return Uri.file(testConfigFilePath);
};

export const clearDockerrc = async () => {
	const fileUri = getFileURI();
	await workspace.fs.delete(fileUri);
};

export const setEmptyDockerrc = async () => {
	const writeData = Buffer.from('', 'utf8');
	await workspace.fs.writeFile(getFileURI(), writeData);
};