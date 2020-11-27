import { DEFAULT_FILE_NAME } from './constants';
import * as messages from './messages';

export class NoFolderOrWorkspaceOpenedError extends Error {
  constructor(message: string = messages.NO_FOLDER_OR_WORKSPACE_OPENED) {
    super(message);
    this.name = `${messages.NO_FOLDER_OR_WORKSPACE_OPENED} Error`;
  }
}

export class AutoGenerateConfigDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = messages.DISABLED_AUTO_GENERATE_CONFIG_ERROR;
  }
}

export class AutoStopNonRelatedDisabledError extends Error {
  constructor(message: string) {
    super(message);
    this.name = messages.DISABLED_AUTO_STOP_NON_RELATED_ERROR;
  }
}

export class DockerrcNotFoundError extends Error {
  constructor(message: string = messages.NO_DEFAULT_FILE_NAME_PROVIDED(DEFAULT_FILE_NAME)) {
    super(message);
    this.name = messages.CONFIGURATION_FILE_NOT_FOUND;
  }
}

export class EmptyConfigError extends Error {
  constructor(message: string, fileName: string) {
    super(message);
    this.setFileName(fileName);
  }

  setFileName(fileName: string) {
    this.name = messages.EMPTY_CONFIG_FILE_NAME(fileName);
  }
}

export class EmptyConfigArrayError extends EmptyConfigError {
  constructor(message = messages.CONFIGURATION_ARRAY_IS_EMPTY, fileName = 'Config Util') {
    super(message, fileName);
  }
}

export class EmptyConfigFileError extends EmptyConfigError {
  constructor(message = messages.CONFIGURATION_FILE_IS_EMPTY, fileName = 'Config Util') {
    super(message, fileName);
  }
}

export class NoContainersFoundError extends Error {
  constructor(message = messages.NO_CONTAINERS_FOUND) {
    super(message);
  }
}

export const handleError = (error: Error) => console.warn(error);
