import { Container } from "dockerode";
import { window } from "vscode";

import { Operation } from "./operation";
import * as messages from '../../common/messages';

export class StopNonRelatedOperation extends Operation {
    constructor() {
        super();
    }

    getProgressTitleForSingleContainer(label: string) {
        return messages.STOPPING_NON_RELATED_CONTAINER(label);
    }

    getProgressTitleForMultipleContainers() {
        return messages.STOPPING_NON_RELATED_CONTAINERS;
    }

    async operate(container: Container, label: string) {

        const containerInfo = await container.inspect();
        const { State: { Running } } = containerInfo;

        if (Running === false) {
            return;
        }

        await container.stop();
        window.showInformationMessage(messages.SUCCESSFULLY_STOPPED_NON_RELATED_CONTAINER(label));
    }
}