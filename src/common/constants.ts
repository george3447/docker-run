import { AutoAddList, ConfigTargetList, ContainerLabelInfo } from './models';

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

export enum AutoAdd {
  YES = 1,
  No = 2,
  SKIP_WORK_SPACE = 3,
  SKIP_GLOBAL = 4
}

export enum ConfigTarget {
  Settings = 1,
  DockerrcFile = 2
}

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
