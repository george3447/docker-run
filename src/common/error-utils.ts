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
        this.name = `Config File Not Found` ;
    }
}

export class EmptyConfigError extends Error {
    constructor(message = 'Configuration Array Is Empty'){
        super(message);
        this.name = 'Empty Config';
    }
}

export const handleError = (error: Error) => console.warn(error);