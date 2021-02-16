import { ext } from '../../src/core/ext-variables';

export const testImage = 'm4rcu5/lighttpd:latest';

export const getMockContainer = async (port: number) => {
  const container = await ext.dockerode.createContainer({
    Image: testImage,
    HostConfig: { PortBindings: { ['80/tcp']: [{ HostPort: `${port}` }] } }
  });
  const containerInfo = await container.inspect();
  return containerInfo.Id.substring(0, 12);
};

export const getMockContainerIds = async (reqNumberOfContainers: number) => {
  const mockContainers = [];

  for (let index = 0; index < reqNumberOfContainers; index++) {
    mockContainers.push(getMockContainer(8000 + index + 1));
  }

  return await Promise.all(mockContainers);
};

export const removeMockContainer = async (mockContainerId: string) => {
  await ext.dockerode.getContainer(mockContainerId).remove({ force: true, v: true });
};

export const removeMockContainers = async (mockContainerIds: Array<string>) => {
  const removePromises: Array<Promise<void>> = [];
  mockContainerIds.forEach((containerId) => {
    removePromises.push(removeMockContainer(containerId));
  });
  await Promise.all(removePromises);
};
