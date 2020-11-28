import * as assert from 'assert';
import * as fs from 'fs';
import { restore, SinonStub, stub } from 'sinon';
import { extensions, workspace } from 'vscode';

import { getConfig, writeConfig } from '../../../common/config';
import { DockerrcNotFoundError, EmptyConfigArrayError, EmptyConfigFileError } from '../../../common/error';
import { isDockerrcDisabled, setEmptyDockerrc } from '../../utils/common';

const mockContainerIds = ['asd123asd123', '123asd123asd123asd'];

suite('Config Tests', async () => {
  test('Should start the extension', async () => {
    const started = extensions.getExtension('george3447.docker-run')?.isActive;
    assert.equal(started, true);
  });

  if (!isDockerrcDisabled()) {
    suite('With no dockerrc file', async () => {
      let fsExistsSyncStub: SinonStub;

      setup(async () => {
        fsExistsSyncStub = stub(fs, 'existsSync');
      });

      teardown(async () => {
        restore();
      });

      test('Should get no dockerrc found error', async () => {
        fsExistsSyncStub.returns(false);
        await assert.rejects(async () => await getConfig(), new DockerrcNotFoundError());
      });
    });

    suite('With dockerrc file', async () => {
      let fsReadFileStub: SinonStub;

      setup(async () => {
        fsReadFileStub = stub(workspace.fs, 'readFile');
      });

      teardown(async () => {
        restore();
      });

      test('Should get empty config file error', async () => {
        fsReadFileStub.resolves('');
        await assert.rejects(async () => await getConfig(), new EmptyConfigFileError());
      });
    });
  }

  test('Should get empty config array error', async () => {
    await writeConfig([]);
    await assert.rejects(async () => await getConfig(), new EmptyConfigArrayError());
  });

  suite('With Mock Config', async () => {
    teardown(async () => {
      await writeConfig([]);
    });

    suiteTeardown(async () => {
      await setEmptyDockerrc();
    });

    test('Should write configuration', async () => {
      await writeConfig(mockContainerIds);
      const currentConfig = await getConfig();
      assert.deepStrictEqual(mockContainerIds, currentConfig);
    });

    test('Should get config', async () => {
      await writeConfig(mockContainerIds);
      const currentConfig = await getConfig();
      assert.deepStrictEqual(mockContainerIds, currentConfig);
    });
  });
});
