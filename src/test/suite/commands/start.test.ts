import { assert, expect } from 'chai';
import { restore, SinonSpy, SinonStub, spy, stub } from 'sinon';
import { commands, window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { ContainerList, getWorkspaceContainers } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StartOperation } from '../../../core/operations';
import { setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Start Command Tests', () => {
  let stubQuickPick: SinonStub;
  let spyShowInformationMessage: SinonSpy;
  let spyWithProgress: SinonSpy;
  let spyShowWarningMessage: SinonSpy;

  suiteSetup(async () => {
    ext.startOperation = new StartOperation();
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
      await commands.executeCommand('docker-run.start');
      const mockMessage = messages.ADD_AT_LEAST_ONE_CONTAINER_TO_WORKSPACE;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });

    test(`Should show '${messages.ALL_CONTAINERS_ARE_RUNNING}' message`, async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
      ext.dockerode.getContainer(mockContainerIds[0]).start();
      await commands.executeCommand('docker-run.start');
      const mockMessage = messages.ALL_CONTAINERS_ARE_RUNNING;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });
  });

  suite('With Available Containers', async () => {
    teardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });

    test('Should show quick pick with container list', async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      stubQuickPick.resolves([]);
      await commands.executeCommand('docker-run.start');

      const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(
        ({ containerId }) => containerId
      );
      assert.ok(stubQuickPick.calledOnce);
      expect(mockContainerIds).to.have.deep.members(stubQuickPickArgs);
    });

    test(`Should show '${messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_START}' warning message, if no container selected`, async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      stubQuickPick.resolves([]);
      const mockMessage = messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_START;

      await commands.executeCommand('docker-run.start');

      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];
      assert.ok(stubQuickPick.calledOnce);
      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });

    test('Should start single container, if single container selected', async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
      const mockContainersList = await getWorkspaceContainers(true);
      stubQuickPick.resolves([{ label: 'Test', containerId: mockContainerIds[0] }]);
      const mockMessage = messages.SUCCESSFULLY_STARTED_CONTAINER('Test');

      await commands.executeCommand('docker-run.start');

      const startedContainers = await getWorkspaceContainers(false, true);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
      expect(startedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should start multiple containers, if multiple containers selected', async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);

      const mockContainersList = await getWorkspaceContainers(true);
      const mockListItems = mockContainerIds.map((containerId, index) => ({
        label: `Test_${index + 1}`,
        containerId
      }));
      stubQuickPick.resolves(mockListItems);
      const mockMessages = mockListItems.map(({ label }) => messages.SUCCESSFULLY_STARTED_CONTAINER(label));

      await commands.executeCommand('docker-run.start');

      const startedContainers = await getWorkspaceContainers(false, true);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);

      assert.ok(stubQuickPick.calledOnce);
      assert.ok(spyWithProgress.calledAfter(stubQuickPick));
      assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainerIds.length);
      expect(mockMessages).to.have.deep.members(spyShowInformationMessageArgs);
      expect(startedContainers).to.have.deep.members(mockContainersList);
    });
  });
});
