import { ConfigurationChangeEvent, ConfigurationTarget, workspace } from 'vscode';

import { CONFIGURATION } from './constants';

type ConfigurationValue = typeof CONFIGURATION[keyof typeof CONFIGURATION];

export function isSettingsDisabled(configurationKey: ConfigurationValue): boolean {
  const configInfo = getConfigurationDetails(configurationKey);
  if (configInfo && (configInfo.globalValue || configInfo.workspaceValue)) {
    return true;
  }
  return false;
}

export function getConfiguration<T>(configurationKey: ConfigurationValue): T | null {
  const configInfo = getConfigurationDetails(configurationKey);
  if (configInfo && (configInfo.globalValue || configInfo.workspaceValue)) {
    return (configInfo.globalValue as T) || (configInfo.workspaceValue as T);
  }
  return null;
}

export async function updateSettings(section: string, value: unknown, configurationTarget: ConfigurationTarget) {
  const workspaceConfiguration = getWorkspaceConfiguration();
  await workspaceConfiguration.update(section, value, configurationTarget);
}

export async function isSettingsChanged(
  configurationChangeEvent: ConfigurationChangeEvent,
  configurationKey: ConfigurationValue
) {
  return configurationChangeEvent.affectsConfiguration(`${CONFIGURATION.SECTION}.${configurationKey}`);
}

function getConfigurationDetails(configurationKey: ConfigurationValue) {
  const workspaceConfiguration = getWorkspaceConfiguration();
  const configurationDetails = workspaceConfiguration.inspect(configurationKey);
  return configurationDetails;
}

function getWorkspaceConfiguration() {
  return workspace.getConfiguration(CONFIGURATION.SECTION);
}
