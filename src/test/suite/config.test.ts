import * as assert from 'assert';
import path = require('path');
import { window, extensions, Uri, workspace } from 'vscode';

import { writeConfig, getConfig } from '../../common/config';
import { DockerrcNotFoundError, EmptyConfigArrayError, EmptyConfigFileError } from '../../common/error';
import { DEFAULT_FILE_NAME } from '../../common/constants';

const testConfigFilePath = path.resolve(__dirname, `../../../src/test/workspace/${DEFAULT_FILE_NAME}`);

const getFileURI = () => {
	return Uri.file(testConfigFilePath);
};

const clearDockerrc = async () => {
	const fileUri = getFileURI();
	await workspace.fs.delete(fileUri);
};

const setEmptyDockerrc = async () => {
	const writeData = Buffer.from('', 'utf8');
	await workspace.fs.writeFile(getFileURI(), writeData);
};

const mockContainerIds = ["asd123asd123", "123asd123asd123asd"];

suite('Config Tests', async () => {

	teardown(async () => {
		await writeConfig([]);
	});


	suiteTeardown(async () => {
		await clearDockerrc();
		await setEmptyDockerrc();
	});

	window.showInformationMessage('Start all tests.');

	test("Should start the extension", async () => {
		const started = extensions.getExtension("george3447.docker-run")?.isActive;
		assert.equal(started, true);
	});

	test("Should get no dockerrc found error", async () => {
		await clearDockerrc();
		const error = await getConfig().catch(error => error);
		assert.deepEqual(error, new DockerrcNotFoundError());
	});

	test("Should get empty config file error", async () => {
		await clearDockerrc();
		await setEmptyDockerrc();
		const error = await getConfig().catch(error => error);
		assert.deepEqual(error, new EmptyConfigFileError());
	});

	test("Should get empty config array error", async () => {
		await writeConfig([]);
		const error = await getConfig().catch(error => error);
		await clearDockerrc();
		assert.deepEqual(error, new EmptyConfigArrayError());
	});

	test("Should write configuration", async () => {
		await writeConfig(mockContainerIds);
		const currentConfig = await getConfig();
		await clearDockerrc();
		assert.deepStrictEqual(mockContainerIds, currentConfig);
	});

	test("Should get config", async () => {
		await writeConfig(mockContainerIds);
		const currentConfig = await getConfig();
		await clearDockerrc();
		assert.deepStrictEqual(mockContainerIds, currentConfig);
	});

});
