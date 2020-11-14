import { Container } from "dockerode";
import { window } from "vscode";

import { Operation } from "./operation";

export class StopNonRelatedOperation extends Operation {
    constructor() {
        super();
    }

    getProgressTitleForSingleContainer(label: string) {
        return `Stopping Non Related Container ${label}`;
    }

    getProgressTitleForMultipleContainers() {
        return `Stopping Non Related Containers`;
    }

    async operate(container: Container, label: string) {

        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === false) {
            return;
        }

        await container.stop();
        window.showInformationMessage(`Successfully Stopped Non Related Container ${label}`);
    }
}