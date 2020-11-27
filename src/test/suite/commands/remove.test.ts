import { assert, expect } from 'chai';
import { restore, SinonSpy, SinonStub, spy, stub } from 'sinon';
import { commands, window } from 'vscode';

import { getConfig, writeConfig } from '../../../common/config';
import { ContainerList } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StopOperation } from '../../../core/operations';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Remove Command Tests', async () => {
  let spyShowInformationMessage: SinonSpy;
  let spyWithProgress: SinonSpy;
  let stubQuickPick: SinonStub;
  let spyShowWarningMessage: SinonSpy;

  suiteSetup(async () => {
    ext.stopOperation = new StopOperation();
  });

  setup(async () => {
    spyShowInformationMessage = spy(window, 'showInformationMessage');
    spyWithProgress = spy(window, 'withProgress');
    stubQuickPick = stub(window, 'showQuickPick');
    spyShowWarningMessage = spy(window, 'showWarningMessage');
  });

  teardown(async () => {
    restore();
  });

  suite('With No Container In Config', async () => {
    test(`Should show '${messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE}' message`, async () => {
      await commands.executeCommand('docker-run.remove');
      const mockMessage = messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });
  });

  suite('With Containers In Config', async () => {
    suiteSetup(async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
    });

    suiteTeardown(async () => {
      await removeMockContainers(mockContainerIds);
      await clearDockerrc();
      await setEmptyDockerrc();
    });

    test('Should show quick pick with available containers', async () => {
      stubQuickPick.resolves([]);
      await commands.executeCommand('docker-run.remove');
      const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(
        ({ containerId }) => containerId
      );
      assert.ok(stubQuickPick.calledOnce);
      expect(mockContainerIds).to.have.deep.members(stubQuickPickArgs);
    });

    test(`Should show '${messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_REMOVE}' warning message, if no container selected from quick pick`, async () => {
      stubQuickPick.resolves([]);
      const mockMessage = messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_REMOVE;

      await commands.executeCommand('docker-run.remove');
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.ok(stubQuickPick.calledOnce);
      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });
  });

  suite('With Containers', async () => {
    setup(async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
    });

    teardown(async () => {
      await removeMockContainers(mockContainerIds);
      await clearDockerrc();
      await setEmptyDockerrc();
    });

    test('Should remove single container and update config, if selected single container', async () => {
      const [selectedContainer, ...remainingContainers] = mockContainerIds;
      await ext.dockerode.getContainer(selectedContainer).start();
      stubQuickPick.resolves([{ label: 'Test', containerId: selectedContainer }]);

      await commands.executeCommand('docker-run.remove');
      const availableContainers = await getConfig();

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      expect(remainingContainers).to.have.deep.members(availableContainers);
    });

    test('Should remove multiple containers and update config, if multiple containers selected', async () => {
      const remainingContainers = [mockContainerIds[0]];
      const selectedContainers = [mockContainerIds[1], mockContainerIds[2]];
      await Promise.all(
        selectedContainers.map((selectedContainerId) => ext.dockerode.getContainer(selectedContainerId).start())
      );
      stubQuickPick.resolves(
        selectedContainers.map((containerId, index) => ({
          label: `Test_${index + 1}`,
          containerId
        }))
      );

      await commands.executeCommand('docker-run.remove');

      const availableContainers = await getConfig();

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      expect(remainingContainers).to.have.deep.members(availableContainers);
    });

    test('Should remove all containers and update config as empty, if all containers selected', async () => {
      stubQuickPick.resolves(
        mockContainerIds.map((mockContainerId) => ({ label: 'Test', containerId: mockContainerId }))
      );

      await commands.executeCommand('docker-run.remove');
      const availableContainers = await getConfig().catch(() => []);

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.isEmpty(availableContainers);
    });
  });
});
