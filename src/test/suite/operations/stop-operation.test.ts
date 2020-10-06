import { spy, SinonSpy } from 'sinon';
import { expect, assert } from 'chai';
import { window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StopOperation } from '../../../core/operations';
import { getAllContainersList, getContainersList } from '../../../common/list';

let mockContainerIds: Array<string> = [];

suite('Stop Operation Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;

    suiteSetup(async () => {
        ext.stopOperation = new StopOperation();
    });

    setup(async () => {
        spyShowInformationMessage = spy(window, "showInformationMessage");
        spyWithProgress = spy(window, "withProgress");
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
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });

        test("Should stop the container", async () => {

            const mockContainersList = await getContainersList(true);
            await ext.dockerode.getContainer(mockContainersList[0].containerId).start();
            await ext.stopOperation.operateContainers(mockContainersList);

            const mockMessage = `Successfully Stopped ${mockContainersList[0].label}`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const stoppedContainers = await getAllContainersList(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should show only progress, if container already stopped", async () => {

            const mockContainersList = await getContainersList(true);
            await ext.stopOperation.operateContainers(mockContainersList);

            const stoppedContainers = await getAllContainersList(false, false);
            assert.ok(spyWithProgress.calledOnce);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should show container not found message", async () => {
            const spyShowErrorMessage = spy(window, "showErrorMessage");
            const mockContainersList = (await getContainersList(true))
                .map((mockContainer, index) => ({ ...mockContainer, containerId: (mockContainer.containerId + index) }));
            await ext.stopOperation.operateContainers(mockContainersList);

            const mockMessage = `No Container With Given Container Id ${mockContainersList[0].containerId} Found`;
            const spyShowErrorMessageArgs = spyShowErrorMessage.getCall(0).args[0];

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowErrorMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowErrorMessageArgs);
            spyShowErrorMessage.restore();
        });
    });

    suite('With Multiple Containers', async () => {

        suiteSetup(async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
        });

        suiteTeardown(async () => {
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });

        test("Should stop all containers", async () => {

            const mockContainersList = await getContainersList(true);
            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
            await ext.stopOperation.operateContainers(mockContainersList);

            const mockMessages = mockContainersList.map(({ label }) => `Successfully Stopped ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const stoppedContainers = await getAllContainersList(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should show only progress, if containers already stopped", async () => {

            const mockContainersList = await getContainersList(true);
            await ext.stopOperation.operateContainers(mockContainersList);

            const stoppedContainers = await getAllContainersList(false, false);
            assert.ok(spyWithProgress.calledOnce);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should show container not found message", async () => {
            const spyShowErrorMessage = spy(window, "showErrorMessage");
            const mockContainersList = (await getContainersList(true))
                .map((mockContainer, index) => ({ ...mockContainer, containerId: (mockContainer.containerId + index) }));
            await ext.stopOperation.operateContainers(mockContainersList);

            const mockMessages = mockContainersList.map(({ containerId }) => `No Container With Given Container Id ${containerId} Found`);
            const spyShowErrorMessageArgs = spyShowErrorMessage.getCalls().map(({ args }) => args[0]);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowErrorMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowErrorMessageArgs);
            spyShowErrorMessage.restore();
        });
    });
});
