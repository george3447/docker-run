import { spy, SinonSpy, restore } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { StopNonRelatedOperation } from '../../../core/operations';
import { getGlobalContainers } from '../../../common/list';
import * as messages from '../../../common/messages';

let mockContainerIds: Array<string> = [];

suite('Stop Non Related Command Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;
    let spyShowWarningMessage: SinonSpy;

    suiteSetup(async () => {
        ext.stopNonRelatedOperation = new StopNonRelatedOperation();
    });

    setup(async () => {
        spyShowWarningMessage = spy(window, 'showWarningMessage');
        spyShowInformationMessage = spy(window, "showInformationMessage");
        spyWithProgress = spy(window, "withProgress");
    });

    teardown(async () => {
        restore();
    });


    suite('With No Non Related Container', async () => {

        test(`Should show '${messages.NO_NON_RELATED_CONTAINER_FOUND}' message`, async () => {
            await commands.executeCommand('docker-run.stop:non-related');
            const mockMessage = messages.NO_NON_RELATED_CONTAINER_FOUND;
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
        });
    });



    suite('With Single Container', async () => {

        suiteSetup(async () => {
            mockContainerIds = await getMockContainerIds(1);
            await ext.dockerode.getContainer(mockContainerIds[0]).start();
        });


        suiteTeardown(async () => {
            await removeMockContainers(mockContainerIds);
        });

        test("Should stop the non related container", async () => {
            const mockContainersList = await getGlobalContainers(false, true);
            await commands.executeCommand('docker-run.stop:non-related');

            const mockMessage = messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(mockContainersList[0].label);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should not show any message and exit silently, if non related container already stopped", async () => {
            await commands.executeCommand('docker-run.stop:non-related');
            assert.ok(spyWithProgress.calledOnce);
            assert.ok(spyShowInformationMessage.notCalled);
        });
    });

    suite('With Multiple Containers', async () => {

        suiteSetup(async () => {
            mockContainerIds = await getMockContainerIds(3);
            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        suiteTeardown(async () => {
            await removeMockContainers(mockContainerIds);
        });

        test("Should stop all non related containers", async () => {

            const mockContainersList = await getGlobalContainers(false, true);
            await commands.executeCommand('docker-run.stop:non-related');

            const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(label));
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        test(`Should show progress message as '${messages.STOPPING_NON_RELATED_CONTAINERS}'`, async () => {

            const mockContainersList = await getGlobalContainers(false, true);
            await commands.executeCommand('docker-run.stop:non-related');

            const mockProgressMessage = messages.STOPPING_NON_RELATED_CONTAINERS;
            const mockMessages = mockContainersList.map(({ label }) => messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(label));
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(spyShowInformationMessageArgs, mockMessages);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        test("Should not show any message and exit silently, if container already stopped", async () => {
            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
            await commands.executeCommand('docker-run.stop:non-related');

            assert.ok(spyWithProgress.calledOnce);
            assert.ok(spyShowInformationMessage.notCalled);

        });
    });
});
