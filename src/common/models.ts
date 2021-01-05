import { QuickPickItem } from 'vscode';

import { AutoAdd, ConfigTarget } from './enums';

export interface AutoAddListItem extends QuickPickItem {
  id: AutoAdd;
}

export type AutoAddList = Array<AutoAddListItem>;

export interface ConfigTargetItem extends QuickPickItem {
  id: ConfigTarget;
}

export type ConfigTargetList = Array<ConfigTargetItem>;

export interface ContainerLabelInfo {
  emptySpace: string;
  openBracket: string;
  closedBracket: string;
  imageSeparator: string;
  name: string;
  imageName: string;
  imageVersion: string;
}

export interface DockerRunCommandListItem extends QuickPickItem {
  id: string;
}

export type DockerRunCommandList = Array<DockerRunCommandListItem>;
