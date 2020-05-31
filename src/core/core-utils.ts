import * as Dockerode from 'dockerode';
import { DockerOptions } from "dockerode";

import { ext } from "./ext-variables";
import { ContainerOperation, OperationType } from '../common/container-operation';
import { window, commands, workspace, ConfigurationTarget } from 'vscode';
import { DEFAULT_FILE_NAME, AutoAdd, autoAddList, CONFIGURATION_KEY } from '../common/constants';
import { SkippedError } from '../common/error-utils';
import { isSkipped } from '../common/config-utils';

export function initDockerode(options?: DockerOptions) {
    ext.dockerode = new Dockerode(options);
}

export function initContainerOperations() {
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

export async function initAutoAdd() {

    if (isSkipped()) {
        throw new SkippedError('Skipped auto generation of file');
    }

    const selection = await window.showQuickPick(autoAddList, {
        placeHolder: `Do You Want To Automatically Generate ${DEFAULT_FILE_NAME} By Docker-Run?`
    });

    if (selection && selection.id) {
        switch (selection.id) {
            case AutoAdd.YES:
                await commands.executeCommand('docker-run.add', true);
                break;
            case AutoAdd.SKIP_WORK_SPACE:
            case AutoAdd.SKIP_GLOBAL:
                const configurationTarget = selection.id === AutoAdd.SKIP_GLOBAL ? ConfigurationTarget.Global : ConfigurationTarget.Workspace;
                const workspaceConfiguration = workspace.getConfiguration(CONFIGURATION_KEY);
                await workspaceConfiguration.update('skip', true, configurationTarget);
                break;
            case AutoAdd.No:
                break;
        }
    }
}