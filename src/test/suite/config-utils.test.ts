import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import path = require('path');
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { commands, window, extensions, Uri, workspace } from 'vscode';
import { writeConfig, getConfig } from '../../common/config-utils';
import { DockerrcNotFoundError, EmptyConfigError, EmptyConfigArrayError, EmptyConfigFileError } from '../../common/error-utils';
import { DEFAULT_FILE_NAME } from '../../common/constants';
// import * as myExtension from '../../extension';

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, ms);
	});
}

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

suite('Config Utils Tests', async () => {

	suiteSetup(async () => {
		//const testFolderPath = path.resolve(__dirname, '../../../', 'test-workspace');
		//const uri = Uri.file(testFolderPath);	
		//console.log('=== START ===');
	});

	teardown(async () => {
		await writeConfig([]);
		//console.log('fired tear down end each');
	});


	suiteTeardown(async () => {
		await clearDockerrc();
		await setEmptyDockerrc();
		//console.log('=== END ===');
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
