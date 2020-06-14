import { workspace, ConfigurationTarget } from "vscode";

import { CONFIGURATION } from "./constants";

export function isSettingsDisabled(configurationKey: string): boolean {
    const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION.SECTION);
    const configInfo = workspaceConfiguration.inspect(configurationKey);
    if (configInfo && (configInfo.globalValue || configInfo.workspaceValue)) {
        return true;
    }
    return false;
}

export async function updateSettings(section: string, value: any, configurationTarget: ConfigurationTarget) {
    const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION.SECTION);
    await workspaceConfiguration.update(section, value, configurationTarget);
}