import { assert, expect } from 'chai';
import { SinonSpy, spy } from 'sinon';
import { window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getGlobalContainers, getWorkspaceContainers } from '../../../common/list';
import * as messages from '../../../common/messages';
import { ext } from '../../../core/ext-variables';
import { StopNonRelatedOperation } from '../../../core/operations';
import { setEmptyDockerrc } from '../../utils/common';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';

let mockContainerIds: Array<string> = [];

suite('Stop Non Related Operation Tests', async () => {
  let spyShowInformationMessage: SinonSpy;
  let spyWithProgress: SinonSpy;

  suiteSetup(async () => {
    ext.stopNonRelatedOperation = new StopNonRelatedOperation();
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

    test('Should stop the container', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.dockerode.getContainer(mockContainersList[0].containerId).start();
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

      const mockMessage = messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(mockContainersList[0].label);
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
      const stoppedContainers = await getGlobalContainers(false, false);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should show only progress, if container already stopped', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

      const stoppedContainers = await getGlobalContainers(false, false);
      assert.ok(spyWithProgress.calledOnce);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should show container not found message', async () => {
      const spyShowWarningMessage = spy(window, 'showWarningMessage');
      const mockContainersList = (await getWorkspaceContainers(true)).map((mockContainer, index) => ({
        ...mockContainer,
        containerId: mockContainer.containerId + index
      }));
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

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

    test('Should stop all containers', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await Promise.all(mockContainerIds.map((mockContainerId) => ext.dockerode.getContainer(mockContainerId).start()));
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

      const mockMessages = mockContainersList.map(({ label }) =>
        messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(label)
      );
      const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
      const stoppedContainers = await getGlobalContainers(false, false);

      assert.ok(spyWithProgress.calledOnce);
      assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
      assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should show only progress, if containers already stopped', async () => {
      const mockContainersList = await getWorkspaceContainers(true);
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

      const stoppedContainers = await getGlobalContainers(false, false);
      assert.ok(spyWithProgress.calledOnce);
      expect(stoppedContainers).to.have.deep.members(mockContainersList);
    });

    test('Should show container not found message', async () => {
      const spyShowWarningMessage = spy(window, 'showWarningMessage');
      const mockContainersList = (await getWorkspaceContainers(true)).map((mockContainer, index) => ({
        ...mockContainer,
        containerId: mockContainer.containerId + index
      }));
      await ext.stopNonRelatedOperation.operateContainers(mockContainersList);

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
