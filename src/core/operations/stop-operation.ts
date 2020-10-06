import { Container } from "dockerode";

import { Operation } from "./operation";

export class StopOperation extends Operation {
    constructor() {
        super({
            message: {
                progress: 'Stopping',
                result: 'Stopped'
            }
        });
    }

    async operate(container: Container, label: string) {

        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === false) {
            return;
        }

        await container.stop();
        this.showMessage(label);
    }
}