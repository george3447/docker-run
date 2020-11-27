import { QuickPickItem } from 'vscode';

import { AutoAdd, ConfigTarget } from './constants';

export interface AutoAddListItem extends QuickPickItem {
  id: AutoAdd;
}

export type AutoAddList = Array<AutoAddListItem>;

export interface ConfigTargetItem extends QuickPickItem {
  id: ConfigTarget;
}

export type ConfigTargetList = Array<ConfigTargetItem>;
