import { Container } from "dockerode";
import { window } from "vscode";

import { Operation } from "./operation";

export class StartOperation extends Operation {
    constructor() {
        super({
            message: {
                progress: 'Starting',
                result: 'Started'
            }
        });
    }

    async operate(container: Container, label: string) {
        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === true) {
            window.showInformationMessage(`Container ${label} Already Running`);
            return;
        }

        await container.start();
    }
}