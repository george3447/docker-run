import { assert, expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getGlobalContainers, getWorkspaceContainers } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StartOperation } from '../../../core/operations';
import { setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Start Operation Tests', async () => {
  let spyShowInformationMessage: SinonSpy;
  let spyWithProgress: SinonSpy;

  suiteSetup(async () => {
    ext.startOperation = new StartOperation();
  });

  setup(async () => {
    spyShowInformationMessage = spy(window, 'showInformationMessage');
    spyWithProgress = spy(window, 'withProgress');
  });

  teardown(async () => {
    spyShowInformationMessage.restore();
    spyWithProgress.restore();
  });

  suite('With Single Container', async () => {
    suiteSetup(async () => {
      mockContainerIds = await getMockContainerIds(1);
      await writeConfig(mockContainerIds);
    });

    suiteTeardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });

    test('Should start the container', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessage = messages.SUCCESSFULLY_STARTED_CONTAINER(mockContainersList[0].label);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test("Should show 'Container already running' message", async () => {
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessage = messages.CONTAINER_ALREADY_RUNNING(mockContainersList[0].label);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test('Should show container not found message', async () => {
      const spyShowWarningMessage = spy(window, 'showWarningMessage');
      const mockContainersList = (await getWorkspaceContainers(true)).map((mockContainer, index) => ({
        ...mockContainer,
        containerId: mockContainer.containerId + index
      }));
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessage = messages.NO_CONTAINER_WITH_CONTAINER_ID_FOUND(mockContainersList[0].containerId);
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowWarningMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessage, spyShowWarningMessageArgs);
      spyShowWarningMessage.restore();
    });
  });

  suite('With Multiple Containers', async () => {
    suiteSetup(async () => {
      mockContainerIds = await getMockContainerIds(3);
      await writeConfig(mockContainerIds);
    });

    suiteTeardown(async () => {
      await Promise.all([removeMockContainers(mockContainerIds), setEmptyDockerrc()]);
    });

    test('Should start all containers', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STARTED_CONTAINER(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test(`Should show progress message as ${messages.STARTING_ALL_CONTAINERS}`, async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList, true);

      const mockProgressMessage = messages.STARTING_ALL_CONTAINERS;
      const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STARTED_CONTAINER(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test(`Should show progress message as '${messages.STARTING_SELECTED_CONTAINERS}'`, async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList);

      const mockProgressMessage = messages.STARTING_SELECTED_CONTAINERS;
      const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STARTED_CONTAINER(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test("Should show 'Container already running' message", async () => {
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessages = mockContainersList.map(({ label }) => messages.CONTAINER_ALREADY_RUNNING(label));
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const runningContainers = await getGlobalContainers(false, true);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(runningContainers).to.have.deep.members(mockContainersList);

      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).stop()));
    });

    test('Should show container not found message', async () => {
      const spyShowWarningMessage = spy(window, 'showWarningMessage');
      const mockContainersList = (await getWorkspaceContainers(true)).map((mockContainer, index) => ({
        ...mockContainer,
        containerId: mockContainer.containerId + index
      }));
      await ext.startOperation.operateContainers(mockContainersList);

      const mockMessages = mockContainersList.map(({ containerId }) =>
        messages.NO_CONTAINER_WITH_CONTAINER_ID_FOUND(containerId)
      );
      const spyShowWarningMessageArgs = spyShowWarningMessage.getCalls().map(({ args }) => args[0]);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowWarningMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowWarningMessageArgs);
      spyShowWarningMessage.restore();
    });
  });
});
