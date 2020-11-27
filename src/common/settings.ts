import { ConfigurationTarget, workspace } from 'vscode';

import { CONFIGURATION } from './constants';

export function isSettingsDisabled(configurationKey: string): boolean {
  const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION.SECTION);
  const configInfo = workspaceConfiguration.inspect(configurationKey);
  if (configInfo && (configInfo.globalValue || configInfo.workspaceValue)) {
    return true;
  }
  return false;
}

export function getConfiguration(configurationKey: string): unknown | null {
  const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION.SECTION);
  const configInfo = workspaceConfiguration.inspect(configurationKey);
  if (configInfo && (configInfo.globalValue || configInfo.workspaceValue)) {
    return configInfo.globalValue || configInfo.workspaceValue;
  }
  return null;
}

export async function updateSettings(section: string, value: unknown, configurationTarget: ConfigurationTarget) {
  const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION.SECTION);
  await workspaceConfiguration.update(section, value, configurationTarget);
}
