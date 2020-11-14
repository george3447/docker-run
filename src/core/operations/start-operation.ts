import { Container } from "dockerode";
import { window } from "vscode";

import { Operation } from "./operation";

export class StartOperation extends Operation {
    constructor() {
        super();
    }

    getProgressTitleForSingleContainer(label: string) {
        return `Starting Container ${label}`;
    }

    getProgressTitleForMultipleContainers(isAll: boolean) {
        return `Starting ${isAll ? 'All' : 'Selected'} Containers`;
    }

    async operate(container: Container, label: string) {
        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === true) {
            window.showInformationMessage(`Container ${label} Already Running`);
            return;
        }

        await container.start();
        window.showInformationMessage(`Successfully Started ${label}`);
    }
}