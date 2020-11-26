import * as assert from 'assert';

import { clearDockerrc, isDockerrcDisabled, setEmptyDockerrc } from '../../utils/common';
import { getMockContainer, getMockContainerIds, removeMockContainer, removeMockContainers } from '../../utils/container';
import { writeConfig } from '../../../common/config';
import { getWorkspaceContainers, extractContainerIds, getGlobalContainers } from '../../../common/list';
import { ext } from '../../../core/ext-variables';
import { EmptyConfigFileError, NoContainersFoundError } from '../../../common/error';

let mockContainerIds: Array<string> = [];

suite('List Tests', async () => {

    if (!isDockerrcDisabled()) {
        test("Should throw empty config file error ", async () => {
            await assert.rejects(async () => getWorkspaceContainers(true), new EmptyConfigFileError(undefined, 'Docker Utils'));
        });
    }
    test("Should throw no containers found error ", async () => {
        await assert.rejects(async () => getGlobalContainers(true), new NoContainersFoundError(undefined));
    });

    suite('With Mock Containers', async () => {

        suiteSetup(async () => {
            mockContainerIds = await getMockContainerIds(3);
            await writeConfig(mockContainerIds);
        });

        suiteTeardown(async () => {
            await removeMockContainers(mockContainerIds);
            await clearDockerrc();
            await setEmptyDockerrc();
        });

        test("Should extract list of containerIds from container list", async () => {
            const containersList = await getWorkspaceContainers(true);
            const containerIdsFromContainerList = extractContainerIds(containersList);
            assert.deepStrictEqual(containerIdsFromContainerList, mockContainerIds);
        });

        test("Should get list of containers from config", async () => {
            const containersList = await getWorkspaceContainers(true);
            assert.strictEqual(containersList.length, mockContainerIds.length);
        });

        test("Should get list of running containers from config", async () => {
            const startedContainer = ext.dockerode.getContainer(mockContainerIds[0]);
            await startedContainer.start();
            const containersList = await getWorkspaceContainers(false, true);
            await startedContainer.stop();
            assert.strictEqual(containersList.length, 1);
        });

        test("Should get list of stopped containers from config", async () => {
            const startedContainer = ext.dockerode.getContainer(mockContainerIds[1]);
            await startedContainer.start();
            const containersList = await getWorkspaceContainers(false, false);
            await startedContainer.stop();
            assert.strictEqual(containersList.length, 2);
        });

        test("Should get list of all containers", async () => {
            const etcContainerId = await getMockContainer(8084);
            const containersList = await getGlobalContainers(true);
            await removeMockContainer(etcContainerId);
            const expected = [etcContainerId, ...mockContainerIds];
            assert.strictEqual(containersList.length, expected.length);
        });

        test("Should get list of running containers", async () => {
            const etcContainerId = await getMockContainer(8084);
            const startedContainer1 = ext.dockerode.getContainer(mockContainerIds[2]);
            const startedContainer2 = ext.dockerode.getContainer(mockContainerIds[0]);
            await Promise.all([startedContainer1.start(), startedContainer2.start()]);
            const containersList = await getGlobalContainers(false, true);
            await Promise.all([
                startedContainer1.stop(),
                startedContainer2.stop(),
                removeMockContainer(etcContainerId)
            ]);
            assert.strictEqual(containersList.length, 2);
        });

        test("Should get list of stopped containers", async () => {
            const etcContainerId = await getMockContainer(8084);
            const startedContainer1 = ext.dockerode.getContainer(mockContainerIds[2]);
            const startedContainer2 = ext.dockerode.getContainer(mockContainerIds[0]);
            await Promise.all([startedContainer1.start(), startedContainer2.start()]);
            const containersList = await getGlobalContainers(false, false);
            await Promise.all([
                startedContainer1.stop(),
                startedContainer2.stop(),
                removeMockContainer(etcContainerId)
            ]);
            assert.strictEqual(containersList.length, 2);
        });
    });

});
