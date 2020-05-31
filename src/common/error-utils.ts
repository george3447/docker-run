export class SkippedError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Skipped Auto Generation Error';
    }
}

export class SelectedNoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Selected No Error';
    }
}

export const handleError = (error: Error) => console.warn(error);