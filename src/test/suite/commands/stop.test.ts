import { assert, expect } from 'chai';
import { restore, SinonSpy, SinonStub, spy, stub } from 'sinon';
import { commands, window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { ContainerList, getWorkspaceContainers } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StopOperation } from '../../../core/operations';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Stop Command Tests', () => {
  let stubQuickPick: SinonStub;
  let spyShowInformationMessage: SinonSpy;
  let spyWithProgress: SinonSpy;
  let spyShowWarningMessage: SinonSpy;

  suiteSetup(async () => {
    ext.stopOperation = new StopOperation();
  });

  setup(async () => {
    spyShowWarningMessage = spy(window, 'showWarningMessage');
    spyShowInformationMessage = spy(window, 'showInformationMessage');
    spyWithProgress = spy(window, 'withProgress');
    stubQuickPick = stub(window, 'showQuickPick');
  });

  teardown(async () => {
    restore();
  });

  suite('With No Available Container', async () => {
    test(`Should show '${messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE}' message`, async () => {
      await commands.executeCommand('docker-run.stop');
      const mockMessage = messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });

    test(`Should show '${messages.ALL_CONTAINERS_ARE_STOPPED}' message`, async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
      ext.dockerode.getContainer(mockContainerIds[0]).stop();
      await commands.executeCommand('docker-run.stop');
      const mockMessage = messages.ALL_CONTAINERS_ARE_STOPPED;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
      await Promise.all([removeMockContainers(mockContainerIds), clearDockerrc()]);
      await setEmptyDockerrc();
    });
  });

  suite('With Available Containers', async () => {
    teardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), clearDockerrc()]);
      await setEmptyDockerrc();
    });

    test('Should show quick pick with container list', async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      stubQuickPick.resolves([]);
      await commands.executeCommand('docker-run.stop');

      const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(
        ({ containerId }) => containerId
      );
      assert.ok(stubQuickPick.calledOnce);
      expect(mockContainerIds).to.have.deep.members(stubQuickPickArgs);
    });

    test(`Should show '${messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_STOP}' warning message, if no container selected`, async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      stubQuickPick.resolves([]);
      const mockMessage = messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_STOP;

      await commands.executeCommand('docker-run.stop');

      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];
      assert.ok(stubQuickPick.calledOnce);
      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });

    test('Should stop single container, if single container selected', async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.dockerode.getContainer(mockContainerIds[0]).start();
      stubQuickPick.resolves([{ label: 'Test', containerId: mockContainerIds[0] }]);
      const mockMessage = messages.SUCCESSFULLY_STOPPED_CONTAINER('Test');

      await commands.executeCommand('docker-run.stop');

      const stoppedContainers = await getWorkspaceContainers(false, false);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should stop multiple containers, if multiple containers selected', async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      const mockContainersList = await getWorkspaceContainers(true);
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      const mockListItems = mockContainerIds.map((containerId, index) => ({
        label: `Test_${index + 1}`,
        containerId
      }));
      stubQuickPick.resolves(mockListItems);
      const mockMessages = mockListItems.map(({ label }) => messages.SUCCESSFULLY_STOPPED_CONTAINER(label));

      await commands.executeCommand('docker-run.stop');

      const stoppedContainers = await getWorkspaceContainers(false, false);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainerIds.length);
      expect(mockMessages).to.have.deep.members(spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });
  });
});
