import { spy, SinonSpy, restore } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StartOperation } from '../../../core/operations';
import { getGlobalContainers, getWorkspaceContainers } from '../../../common/list';

let mockContainerIds: Array<string> = [];

suite('Start All Command Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;
    let spyShowWarningMessage: SinonSpy;

    suiteSetup(async () => {
        ext.startOperation = new StartOperation();
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
            await commands.executeCommand('docker-run.start:all');
            const mockMessage = `No Containers Found For This Workspace`;
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
        });
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

        test("Should start the container", async () => {
            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.start:all');

            const mockMessage = `Successfully Started ${mockContainersList[0].label}`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const runningContainers = await getGlobalContainers(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show container already running message", async () => {
            await ext.dockerode.getContainer(mockContainerIds[0]).start();
            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.start:all');

            const mockMessage = `Container ${mockContainersList[0].label} Already Running`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const runningContainers = await getGlobalContainers(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
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

        test("Should start all containers", async () => {

            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.start:all');

            const mockMessages = mockContainersList.map(({ label }) => `Successfully Started ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const runningContainers = await getGlobalContainers(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show progress message as 'Starting All Containers'", async () => {

            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.start:all');

            const mockProgressMessage = `Starting All Containers`;
            const mockMessages = mockContainersList.map(({ label }) => `Successfully Started ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const runningContainers = await getGlobalContainers(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(mockProgressMessage, spyWithProgress.getCall(0).args[0].title);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show containers already running message", async () => {

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
            const mockContainersList = await getWorkspaceContainers(true);
            await commands.executeCommand('docker-run.start:all');

            const mockMessages = mockContainersList.map(({ label }) => `Container ${label} Already Running`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const runningContainers = await getGlobalContainers(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });
    });
});
