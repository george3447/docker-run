import { AutoAdd } from "./constants";
import { QuickPickItem } from "vscode";

export interface AutoAddListItem extends QuickPickItem {
    id: AutoAdd;
}

export type AutoAddList = Array<AutoAddListItem>;