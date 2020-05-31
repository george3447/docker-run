import * as Dockerode from 'dockerode';
import { DockerOptions } from "dockerode";

import { ext } from "./ext-variables";
import { ContainerOperation, OperationType } from '../common/container-operation';

export function initDockerode(options?: DockerOptions) {
    ext.dockerode = new Dockerode(options);
}

export function initContainerOperations(){
    ext.startOperation = new ContainerOperation({
        type: OperationType.START,
        message: {
            progress: 'Starting',
            status: 'Running',
            result: 'Started'
        }
    });

    ext.stopOperation = new ContainerOperation({
        type: OperationType.STOP,
        message: {
            progress: 'Stopping',
            status: 'Stopped',
            result: 'Stopped'
        }
    });
}