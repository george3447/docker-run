import { Container } from "dockerode";

import { Operation } from "./operation";

export class StopNonRelatedOperation extends Operation {
    constructor() {
        super({
            message: {
                progress: 'Stopping Non Related',
                result: 'Stopped Non Related Container'
            }
        });
    }

    async operate(container: Container, label: string) {
        await container.stop();
        this.showMessage(label);
    }
}