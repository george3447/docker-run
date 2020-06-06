import { DEFAULT_FILE_NAME } from "./constants";

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

    constructor(message: string, private fileName: string) {
        super(message);
        this.setFileName(fileName);
    }

    setFileName(fileName: string) {
        this.name = `Empty Config [${this.fileName}]`;
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

export const handleError = (error: Error) => console.warn(error);