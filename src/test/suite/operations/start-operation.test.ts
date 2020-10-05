import { spy, SinonSpy } from 'sinon';
import { expect, assert } from 'chai';
import { window } from 'vscode';

import { writeConfig } from '../../../common/config';
import { testImage, getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { initDockerode } from '../../../core/core';
import { StartOperation } from '../../../core/operations';
import { getAllContainersList, getContainersList } from '../../../common/list';

let mockContainerIds: Array<string> = [];

suite('Start Operation Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;

    suiteSetup(async () => {
        initDockerode();
        ext.startOperation = new StartOperation();
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

        suiteSetup((done) => {
            ext.dockerode.pull(testImage, {}, (err, stream) => {
                if (err) { return done(err); }
                stream.pipe(process.stdout);
                stream.once('end', async () => {
                    mockContainerIds = await getMockContainerIds(1);
                    await writeConfig(mockContainerIds);
                    done();
                });
            });
        });

        suiteTeardown(async () => {
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await Promise.all([
                ext.dockerode.getImage(testImage).remove(),
                setEmptyDockerrc()
            ]);
        });

        test("Should start the container", async () => {

            const mockContainersList = await getContainersList(true);
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessage = `Successfully Started ${mockContainersList[0].label}`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const runningContainers = await getAllContainersList(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show container already running message", async () => {

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
            const mockContainersList = await getContainersList(true);
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessage = `Container ${mockContainersList[0].label} Already Running`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const runningContainers = await getAllContainersList(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show container not found message", async () => {
            const spyShowErrorMessage = spy(window, "showErrorMessage");
            const mockContainersList = (await getContainersList(true))
                .map((mockContainer, index) => ({ ...mockContainer, containerId: (mockContainer.containerId + index) }));
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessage = `No Container With Given Container Id ${mockContainersList[0].containerId} Found`;
            const spyShowErrorMessageArgs = spyShowErrorMessage.getCall(0).args[0];

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowErrorMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessage, spyShowErrorMessageArgs);
            spyShowErrorMessage.restore();
        });
    });

    suite('With Multiple Containers', async () => {

        suiteSetup((done) => {
            ext.dockerode.pull(testImage, {}, (err, stream) => {
                if (err) { return done(err); }
                stream.pipe(process.stdout);
                stream.once('end', async () => {
                    mockContainerIds = await getMockContainerIds(3);
                    await writeConfig(mockContainerIds);
                    done();
                });
            });
        });

        suiteTeardown(async () => {
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await Promise.all([
                ext.dockerode.getImage(testImage).remove(),
                setEmptyDockerrc()
            ]);
        });

        test("Should start all containers", async () => {

            const mockContainersList = await getContainersList(true);
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessages = mockContainersList.map(({ label }) => `Successfully Started ${label}`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const runningContainers = await getAllContainersList(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show containers already running message", async () => {

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).start()));
            const mockContainersList = await getContainersList(true);
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessages = mockContainersList.map(({ label }) => `Container ${label} Already Running`);
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);
            const runningContainers = await getAllContainersList(false, true);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowInformationMessageArgs);
            expect(runningContainers).to.have.deep.members(mockContainersList);

            await Promise.all(mockContainerIds.map(mockContainerId => ext.dockerode.getContainer(mockContainerId).stop()));
        });

        test("Should show container not found message", async () => {
            const spyShowErrorMessage = spy(window, "showErrorMessage");
            const mockContainersList = (await getContainersList(true))
                .map((mockContainer, index) => ({ ...mockContainer, containerId: (mockContainer.containerId + index) }));
            await ext.startOperation.operateContainers(mockContainersList);

            const mockMessages = mockContainersList.map(({ containerId }) => `No Container With Given Container Id ${containerId} Found`);
            const spyShowErrorMessageArgs = spyShowErrorMessage.getCalls().map(({ args }) => args[0]);

            assert.ok(spyWithProgress.calledOnce);
            assert.strictEqual(spyShowErrorMessage.callCount, mockContainersList.length);
            assert.deepEqual(mockMessages, spyShowErrorMessageArgs);
            spyShowErrorMessage.restore();
        });
    });
});
