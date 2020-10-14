import { spy, SinonSpy, restore } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StopOperation } from '../../../core/operations';
import { getGlobalContainers, getWorkspaceContainers } from '../../../common/list';

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
        spyShowInformationMessage = spy(window, "showInformationMessage");
        spyWithProgress = spy(window, "withProgress");
    });

    teardown(async () => {
        restore();
    });


    suite('With No Available Container', async () => {

        test("Should show no container found message", async () => {
            await commands.executeCommand('docker-run.stop:all');
            const mockMessage = `No Containers Found For This Workspace`;
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
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });

        test("Should stop the container", async () => {
            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.stop:all');

            const mockMessage = `Successfully Stopped ${mockContainersList[0].label}`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);
        });

        test("Should not show any message and exit silently, if container already stopped", async () => {
            await commands.executeCommand('docker-run.stop:all');
            assert.ok(spyWithProgress.calledOnce);
            assert.ok(spyShowInformationMessage.notCalled);
        });
    });

    suite('With Multiple Containers', async () => {

        suiteSetup(async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        suiteTeardown(async () => {
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });

        test("Should stop all containers", async () => {

            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.stop:all');

            const mockMessages = mockContainersList.map(({ label }) => `Successfully Stopped ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        test("Should show progress message as 'Stopping All Containers'", async () => {

            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.stop:all');

            const mockProgressMessage = `Stopping All Containers`;
            const mockMessages = mockContainersList.map(({ label }) => `Successfully Stopped ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const stoppedContainers = await getGlobalContainers(false, false);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(stoppedContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
        });

        test("Should not show any message and exit silently, if container already stopped", async () => {
            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
            await commands.executeCommand('docker-run.stop:all');

            assert.ok(spyWithProgress.calledOnce);
            assert.ok(spyShowInformationMessage.notCalled);

        });
    });
});
