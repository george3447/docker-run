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

export const COMMANDS = {
  ADD: 'docker-run.add',
  REMOVE: 'docker-run.remove',
  START: 'docker-run.start',
  START_ALL: 'docker-run.start:all',
  STOP: 'docker-run.stop',
  STOP_ALL: 'docker-run.stop:all',
  STOP_NON_RELATED: 'docker-run.stop:non-related'
};

//TODO: Find a way to get the commands directly from package.json
export const dockerRunCommands = [
  {
    command: COMMANDS.ADD,
    title: 'Add Containers'
  },
  {
    command: COMMANDS.REMOVE,
    title: 'Remove Containers'
  },
  {
    command: COMMANDS.START,
    title: 'Start Containers'
  },
  {
    command: COMMANDS.START_ALL,
    title: 'Start All Containers'
  },
  {
    command: COMMANDS.STOP,
    title: 'Stop Containers'
  },
  {
    command: COMMANDS.STOP_ALL,
    title: 'Stop All Containers'
  },
  {
    command: COMMANDS.STOP_NON_RELATED,
    title: 'Stop Non Related Containers'
  }
];

export const dockerRunCommandList: DockerRunCommandList = dockerRunCommands.map(({ command, title }) => ({
  id: command,
  label: title
}));
