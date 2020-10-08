import { spy, SinonSpy, stub, SinonStub, restore } from 'sinon';
import { expect, assert } from 'chai';
import { window, commands } from 'vscode';

import { getConfig, writeConfig } from '../../../common/config';
import { getMockContainerIds, removeMockContainers } from '../../utils/container';
import { ext } from '../../../core/ext-variables';
import { clearDockerrc, setEmptyDockerrc } from '../../utils/common';
import { StopOperation } from '../../../core/operations';
import { ContainerList } from '../../../common/list';

let mockContainerIds: Array<string> = [];

suite('Remove Command Tests', async () => {

    let spyShowInformationMessage: SinonSpy;
    let spyWithProgress: SinonSpy;
    let stubQuickPick: SinonStub;
    let spyShowWarningMessage: SinonSpy;

    suiteSetup(async () => {
        ext.stopOperation = new StopOperation();
    });

    setup(async () => {
        spyShowInformationMessage = spy(window, "showInformationMessage");
        spyWithProgress = spy(window, "withProgress");
        stubQuickPick = stub(window, 'showQuickPick');
        spyShowWarningMessage = spy(window, 'showWarningMessage');
    });

    teardown(async () => {
        restore();
    });


    suite('With No Container In Config', async () => {

        test("Should show 'add at least one container' message", async () => {
            await commands.executeCommand('docker-run.remove');
            const mockMessage = `Please Add At least One Container To Workspace`;
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
        });
    });

    suite('With Containers In Config', async () => {

        teardown(async () => {
            await removeMockContainers(mockContainerIds);
            await clearDockerrc();
            await setEmptyDockerrc();
        });

        test("Should show quick pick with available containers", async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
            stubQuickPick.resolves([] as any);

            await commands.executeCommand('docker-run.remove');
            const stubQuickPickArgs = (stubQuickPick.getCall(0).args[0] as ContainerList).map(({ containerId }) => containerId);
            assert.ok(stubQuickPick.calledOnce);
            expect(mockContainerIds).to.have.deep.members(stubQuickPickArgs);

        });

        test("Should show 'select at least one container' warning message, if no container selected from quick pick", async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
            stubQuickPick.resolves([] as any);
            const mockMessage = `Please Select At least One Container To Remove`;

            await commands.executeCommand('docker-run.remove');
            const spyShowWarningMessageArgs = spyShowWarningMessage.getCall(0).args[0];

            assert.ok(stubQuickPick.calledOnce);
            assert.strictEqual(mockMessage, spyShowWarningMessageArgs);
        });

        test("Should remove single container and update config, if selected single container", async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
            const [selectedContainer, ...remainingContainers] = mockContainerIds;
            await ext.dockerode.getContainer(selectedContainer).start();
            stubQuickPick.resolves([{ label: 'Test', containerId: selectedContainer }] as any);

            await commands.executeCommand('docker-run.remove');
            const availableContainers = await getConfig();

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
            expect(remainingContainers).to.have.deep.members(availableContainers);
        });


        test("Should remove multiple containers and update config, if multiple containers selected", async () => {
            mockContainerIds = await getMockContainerIds(3);
            const remainingContainers = [mockContainerIds[0]];
            const selectedContainers = [mockContainerIds[1], mockContainerIds[2]];
            await Promise.all(selectedContainers
                .map(selectedContainerId => ext.dockerode.getContainer(selectedContainerId).start()));
            stubQuickPick.resolves(selectedContainers
                .map((containerId, index) => ({ label: `Test_${index + 1}`, containerId })) as any);

            await writeConfig(mockContainerIds);
            await commands.executeCommand('docker-run.remove');

            const availableContainers = await getConfig();

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.ok(spyShowInformationMessage.calledAfter(spyWithProgress));
            expect(remainingContainers).to.have.deep.members(availableContainers);
        });

        test("Should remove all containers and update config as empty, if all containers selected", async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
            stubQuickPick.resolves(mockContainerIds
                .map(mockContainerId => ({ label: 'Test', containerId: mockContainerId }))
            );

            await commands.executeCommand('docker-run.remove');
            const availableContainers = await getConfig().catch(() => []);

            assert.ok(stubQuickPick.calledOnce);
            assert.ok(spyWithProgress.calledAfter(stubQuickPick));
            assert.isEmpty(availableContainers);
        });
    });
});
