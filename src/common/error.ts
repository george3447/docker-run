import { DEFAULT_FILE_NAME } from "./constants";
import * as messages from './messages';

export class NoFolderOrWorkspaceOpenedError extends Error {
    constructor(message: string = "No folder or workspace opened") {
        super(message);
        this.name = 'No Folder Or Workspace Opened Error';
    }
}

export class AutoGenerateConfigDisabledError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Disabled Auto Generate Config Error';
    }
}

export class AutoStopNonRelatedDisabledError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Disabled Auto Stop Non Related Error';
    }
}

export class SelectedNoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Selected No Error';
    }
}

export class DockerrcNotFoundError extends Error {
    constructor(message: string = `No ${DEFAULT_FILE_NAME} provided`) {
        super(message);
        this.name = `Config File Not Found`;
    }
}

export class EmptyConfigError extends Error {

    constructor(message: string, fileName: string) {
        super(message);
        this.setFileName(fileName);
    }

    setFileName(fileName: string) {
        this.name = `Empty Config [${fileName}]`;
    }
}

export class EmptyConfigArrayError extends EmptyConfigError {

    constructor(message = 'Configuration Array Is Empty', fileName = "Config Util") {
        super(message, fileName);
    }
}

export class EmptyConfigFileError extends EmptyConfigError {

    constructor(message = 'Configuration File Is Empty', fileName = "Config Util") {
        super(message, fileName);
    }
}

export class NoContainersFoundError extends Error {

    constructor(message = messages.NO_CONTAINERS_FOUND) {
        super(message);
    }
}

export const handleError = (error: Error) => console.warn(error);