import { spy, SinonSpy, stub, SinonStub, restore } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StartOperation } from '../../../core/operations';
import { ContainerList } from '../../../common/list';
import * as messages from '../../../common/messages';

let mockContainerIds: Array<string> = [];

suite('Add Command Tests', async () => {

    let stubQuickPick: SinonStub;
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
        stubQuickPick = stub(window, 'showQuickPick');
    });

    teardown(async () => {
        restore();
    });


    suite('With No Available Container', async () => {

        test("Should show no container found message", async () => {
            await commands.executeCommand('docker-run.add');
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.strictEqual(messages.NO_CONTAINERS_FOUND, spyShowWarningMessageArgs);
        });
    });

    suite('With Available Containers', async () => {

        teardown(async () => {
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });


        test(`Should show message '${messages.ALREADY_ADDED_TO_WORKSPACE}', if no container left to add`, async () => {
            mockContainerIds = await getMockContainerIds(1);
            await writeConfig(mockContainerIds);

            await commands.executeCommand('docker-run.add');
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];
            assert.ok(spyShowWarningMessage.calledOnce);
            assert.strictEqual(messages.ALREADY_ADDED_TO_WORKSPACE, spyShowWarningMessageArgs);
        });

        test("Should show quick pick with available containers, if no config file available", async () => {
            mockContainerIds = await getMockContainerIds(3);
            stubQuickPick.resolves([] as any);

            await commands.executeCommand('docker-run.add');
            const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(({ containerId }) => containerId);
            assert.ok(stubQuickPick.calledOnce);
            expect(mockContainerIds).to.have.deep.members(stubQuickPickArgs);

        });

        test("Should show quick pick with remaining containers, if config available", async () => {
            mockContainerIds = await getMockContainerIds(3);
            const [containerForConfig, ...remainingContainers] = mockContainerIds;
            await writeConfig([containerForConfig]);
            stubQuickPick.resolves([] as any);

            await commands.executeCommand('docker-run.add');
            const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(({ containerId }) => containerId);
            assert.ok(stubQuickPick.calledOnce);
            expect(remainingContainers).to.have.deep.members(stubQuickPickArgs);
        });


        test(`Should show '${messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_ADD}' warning message, if no container selected`, async () => {
            mockContainerIds = await getMockContainerIds(3);
            stubQuickPick.resolves([] as any);

            await commands.executeCommand('docker-run.add');
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.ok(stubQuickPick.calledOnce);
            assert.strictEqual(messages.SELECT_AT_LEAST_ONE_CONTAINER_TO_ADD, spyShowWarningMessageArgs);
        });

        test("Should create config and start single container, if single container selected", async () => {
            mockContainerIds = await getMockContainerIds(1);
            stubQuickPick.resolves([{ label: 'Test', containerId: mockContainerIds[0] }] as any);
            const mockMessage = messages.SUCCESSFULLY_STARTED_CONTAINER('Test');

            await commands.executeCommand('docker-run.add', true);

            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
            assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
        });

        test("Should create config and start multiple containers, if multiple containers selected", async () => {
            mockContainerIds = await getMockContainerIds(2);
            const mockListItems = mockContainerIds.map((containerId, index) => ({
                label: `Test_${index + 1}`, containerId
            }));
            stubQuickPick.resolves(mockListItems as any);
            const mockMessages = mockListItems.map(({ label }) => messages.SUCCESSFULLY_STARTED_CONTAINER(label));

            await commands.executeCommand('docker-run.add', true);

            const spyShowInformationMessageArgs = spyShowInformationMessage.getCalls().map(({ args }) => args[0]);

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
            assert.strictEqual(spyShowInformationMessage.callCount, mockContainerIds.length);
            expect(mockMessages).to.have.deep.members(spyShowInformationMessageArgs);
        });
    });
});
