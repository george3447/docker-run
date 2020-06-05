import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import path = require('path');
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { commands, window, extensions, Uri, workspace } from 'vscode';
import { writeConfig, getConfig } from '../../common/config-utils';
import { DockerrcNotFoundError, EmptyConfigError } from '../../common/error-utils';
import { DEFAULT_FILE_NAME } from '../../common/constants';
// import * as myExtension from '../../extension';

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

const getFileURI = () => {
	const testConfigFilePath = path.resolve(__dirname, `../../../src/test/workspace/${DEFAULT_FILE_NAME}`);
	return Uri.file(testConfigFilePath);
};

const mockContainerIds = ["asd123asd123", "123asd123asd123asd"];

suite('Extension Test Suite', async () => {

	// suiteSetup(async () => {
	// 	const testFolderPath = path.resolve(__dirname, '../../../', 'test-workspace');
	// 	const uri = Uri.file(testFolderPath);	
	// });

	suiteTeardown(async () => {
		await writeConfig([]);
	});

	window.showInformationMessage('Start all tests.');

	test("Should start the extension", async () => {
		const started = extensions.getExtension("george3447.docker-run")?.isActive;
		assert.equal(started, true);
	});

	test("Should get no dockerrc found error", async () => {
		let error;
		const fileUri = getFileURI();
		await workspace.fs.delete(fileUri);
		await getConfig().catch(e => error = e);
		assert.deepEqual(error, new DockerrcNotFoundError());
	});

	test("Should get empty config error", async () => {
		let error;
		await writeConfig([]);
		await getConfig().catch(e => error = e);
		assert.deepEqual(error, new EmptyConfigError());
	});

	test("Should write configuration", async () => {
		await writeConfig(mockContainerIds);
		const currentConfig = await getConfig();
		const fileUri = getFileURI();
		await workspace.fs.delete(fileUri);
		assert.deepStrictEqual(mockContainerIds, currentConfig);
	});

	test("Should get config", async () => {
		await writeConfig(mockContainerIds);
		const currentConfig = await getConfig();
		const fileUri = getFileURI();
		await workspace.fs.delete(fileUri);
		assert.deepStrictEqual(mockContainerIds, currentConfig);
	});

});
