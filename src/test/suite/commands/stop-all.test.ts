import { assert, expect } from 'chai';
import { restore, SinonSpy, spy } from 'sinon';
import { commands, window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getGlobalContainers, getWorkspaceContainers } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StopOperation } from '../../../core/operations';
import { setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Stop All Command Tests', async () => {
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
  });

  teardown(async () => {
    restore();
  });

  suite('With No Available Container', async () => {
    test('Should show no container found message', async () => {
      await commands.executeCommand('docker-run.stop:all');
      const mockMessage = messages.NO_CONTAINERS_FOUND_FOR_THIS_WORKSPACE;
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
    });
  });

  suite('With Single Container', async () => {
    suiteSetup(async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
      await ext.dockerode.getContainer(mockContainerIds[0]).start();
    });

    suiteTeardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });

    test('Should stop the container', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await commands.executeCommand('docker-run.stop:all');

      const mockMessage = messages.SUCCESSFULLY_STOPPED_CONTAINER(mockContainersList[0].label);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
      const stoppedContainers = await getGlobalContainers(false, false);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should not show any message and exit silently, if container already stopped', async () => {
      await commands.executeCommand('docker-run.stop:all');
      assert.ok(spyWithProgress.calledOnce);
      assert.ok(spyShowInformationMessage.notCalled);
    });
  });

  suite('With Multiple Containers', async () => {
    suiteSetup(async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
    });

    suiteTeardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });

    test('Should stop all containers', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await commands.executeCommand('docker-run.stop:all');

      const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STOPPED_CONTAINER(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const stoppedContainers = await getGlobalContainers(false, false);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
    });

    test(`Should show progress message as '${messages.STOPPING_ALL_CONTAINERS}'`, async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await commands.executeCommand('docker-run.stop:all');

      const mockProgressMessage = messages.STOPPING_ALL_CONTAINERS;
      const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STOPPED_CONTAINER(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const stoppedContainers = await getGlobalContainers(false, false);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
    });

    test('Should not show any message and exit silently, if container already stopped', async () => {
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
      await commands.executeCommand('docker-run.stop:all');

      assert.ok(spyWithProgress.calledOnce);
      assert.ok(spyShowInformationMessage.notCalled);
    });
  });
});
