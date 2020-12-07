import { AutoAdd, ConfigTarget } from './enums';
import { AutoAddList, ConfigTargetList, ContainerLabelInfo, DockerRunCommandList } from './models';

export const DEFAULT_FILE_NAME = '.dockerrc';
export const CONFIGURATION_KEY = 'DockerRun';

export const CONFIGURATION = {
  SECTION: 'DockerRun',
  DISABLE_AUTO_GENERATE_CONFIG: 'DisableAutoGenerateConfig',
  DISABLE_AUTO_STOP_NON_RELATED: 'DisableAutoStopNonRelated',
  DISABLE_DOCKERRC: 'DisableDockerrc',
  CONTAINERS: 'Containers',
  DISABLE_STATUS_BAR_ITEM: 'DisableStatusBarItem',
  STATUS_BAR_ITEM_REFRESH_INTERVAL: 'StatusBarItemRefreshInterval'
} as const;

export const autoAddList: AutoAddList = [
  { label: 'Yes', id: AutoAdd.YES },
  { label: 'No', id: AutoAdd.No },
  { label: 'Never add for this workspace', id: AutoAdd.SKIP_WORK_SPACE },
  { label: 'Never, I will add it myself for each workspaces', id: AutoAdd.SKIP_GLOBAL }
];

export const configTargetList: ConfigTargetList = [
  { label: 'VS Code settings', id: ConfigTarget.Settings, picked: true },
  { label: 'Separate .dockerrc file', id: ConfigTarget.DockerrcFile }
];

export const defaultContainerLabelFormat: Array<keyof ContainerLabelInfo> = [
  'imageName',
  'imageSeparator',
  'imageVersion',
  'emptySpace',
  'openBracket',
  'name',
  'closedBracket'
];

export const defaultContainerLabelFormatSymbols: Omit<ContainerLabelInfo, 'name' | 'imageName' | 'imageVersion'> = {
  emptySpace: ' ',
  imageSeparator: ':',
  openBracket: '(',
  closedBracket: ')'
};

//TODO: Find a way to get the commands directly from package.json
export const dockerRunCommands = [
  {
    command: 'docker-run.add',
    title: 'Add Containers'
  },
  {
    command: 'docker-run.remove',
    title: 'Remove Containers'
  },
  {
    command: 'docker-run.start:all',
    title: 'Start All Containers'
  },
  {
    command: 'docker-run.stop:all',
    title: 'Stop All Containers'
  },
  {
    command: 'docker-run.stop:non-related',
    title: 'Stop Non Related Containers'
  },
  {
    command: 'docker-run.start',
    title: 'Start Containers'
  },
  {
    command: 'docker-run.stop',
    title: 'Stop Containers'
  }
];

export const dockerRunCommandList: DockerRunCommandList = dockerRunCommands.map(({ command, title }) => ({
  id: command,
  label: title
}));
