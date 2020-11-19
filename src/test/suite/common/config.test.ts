import * as assert from 'assert';
import { window, extensions } from 'vscode';

import { writeConfig, getConfig } from '../../../common/config';
import { DockerrcNotFoundError, EmptyConfigArrayError, EmptyConfigFileError } from '../../../common/error';
import { clearDockerrc, isDockerrcDisabled, setEmptyDockerrc } from '../../utils/common';

const mockContainerIds = ["asd123asd123", "123asd123asd123asd"];

suite('Config Tests', async () => {

	test("Should start the extension", async () => {
		const started = extensions.getExtension("george3447.docker-run")?.isActive;
		assert.equal(started, true);
	});

	if (!isDockerrcDisabled()) {

		test("Should get no dockerrc found error", async () => {
			await clearDockerrc();
			await assert.rejects(async () => await getConfig(), new DockerrcNotFoundError());
		});

		test("Should get empty config file error", async () => {
			await setEmptyDockerrc();
			await assert.rejects(async () => await getConfig(), new EmptyConfigFileError());
		});
	}

	test("Should get empty config array error", async () => {
		await writeConfig([]);
		await assert.rejects(async () => await getConfig(), new EmptyConfigArrayError());
	});

	suite('With Mock Config', async () => {

		teardown(async () => {
			await writeConfig([]);
		});

		suiteTeardown(async () => {
			await clearDockerrc();
			await setEmptyDockerrc();
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
});
