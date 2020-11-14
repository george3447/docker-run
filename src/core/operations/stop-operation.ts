import { Container } from "dockerode";
import { window } from "vscode";

import { Operation } from "./operation";

export class StopOperation extends Operation {
    constructor() {
        super();
    }

    getProgressTitleForSingleContainer(label: string) {
        return `Stopping Container ${label}`;
    }

    getProgressTitleForMultipleContainers(isAll: boolean) {
        return `Stopping ${isAll ? 'All' : 'Selected'} Containers`;
    }

    async operate(container: Container, label: string) {

        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === false) {
            return;
        }

        await container.stop();
        window.showInformationMessage(`Successfully Stopped ${label}`);
    }
}