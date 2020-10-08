import { spy, SinonSpy, stub, SinonStub } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StartOperation } from '../../../core/operations';
import { ContainerList } from '../../../common/list';

let mockContainerIds: Array<string> = [];

suite('Add Command Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;

    suiteSetup(async () => {
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


    suite('With No Available Container', async () => {

        test("Should show no container available message", async () => {
            await commands.executeCommand('docker-run.add');
            const mockMessage = `No Containers Available`;
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];

            assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
        });
    });

    suite('With Available Containers', async () => {

        let stubQuickPick: SinonStub;

        setup(() => {
            stubQuickPick = stub(window, 'showQuickPick');
        });

        teardown(async () => {
            stubQuickPick.restore();
            await Promise.all([
                removeMockContainers(mockContainerIds),
                clearDockerrc()
            ]);
            await setEmptyDockerrc();
        });


        test("Should show message, if no container left to add", async () => {
            mockContainerIds = await getMockContainerIds(1);
            await writeConfig(mockContainerIds);

            await commands.executeCommand('docker-run.add');
            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];
            const mockMessage = `All Available Containers Are Already Added`;
            assert.ok(spyShowInformationMessage.calledOnce);
            assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
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


        test("Should show quick pick, create config and start single container", async () => {
            mockContainerIds = await getMockContainerIds(1);
            stubQuickPick.resolves([{ label: 'Test', containerId: mockContainerIds[0] }] as any);
            const mockMessage = `Successfully Started Test`;

            await commands.executeCommand('docker-run.add', true);

            const spyShowInformationMessageArgs = spyShowInformationMessage.getCall(0).args[0];

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
            assert.strictEqual(mockMessage, spyShowInformationMessageArgs);
        });

        test("Should show quick pick, create config and start multiple containers", async () => {
            mockContainerIds = await getMockContainerIds(2);
            const mockListItems = mockContainerIds.map((containerId, index) => ({
                label: `Test_${index + 1}`, containerId
            }));
            stubQuickPick.resolves(mockListItems as any);
            const mockMessages = mockListItems.map(({ label }) => `Successfully Started ${label}`);

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