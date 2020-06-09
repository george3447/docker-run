import { AutoAddList } from './models';
import { OperationConfig, OperationType } from './container';

export const DEFAULT_FILE_NAME = '.dockerrc';
export const CONFIGURATION_KEY = 'DockerRun';

export const CONFIGURATION = {
    SECTION: 'DockerRun',
    DISABLE_AUTO_GENERATE_CONFIG: 'DisableAutoGenerateConfig',
    DISABLE_AUTO_STOP_NON_RELATED: 'DisableAutoStopNonRelated'
};

export enum AutoAdd {
    YES = 1,
    No = 2,
    SKIP_WORK_SPACE = 3,
    SKIP_GLOBAL = 4
}
export const autoAddList: AutoAddList = [
    { label: 'Yes', id: AutoAdd.YES },
    { label: 'No', id: AutoAdd.No },
    { label: 'Never Add For This Workspace', id: AutoAdd.SKIP_WORK_SPACE },
    { label: 'Never, I Will Add It Myself For Each Workspaces', id: AutoAdd.SKIP_GLOBAL }
];

export const startOperation: OperationConfig = {
    type: OperationType.START,
    message: {
        progress: 'Starting',
        status: 'Running',
        result: 'Started'
    }
};

export const stopOperation: OperationConfig = {
    type: OperationType.STOP,
    message: {
        progress: 'Stopping',
        status: 'Stopped',
        result: 'Stopped'
    }
};

export const stopNonRelatedOperation: OperationConfig = {
    type: OperationType.STOP,
    message: {
        progress: 'Stopping Non Related',
        status: 'Stopped',
        result: 'Stopped Non Related Container'
    }
};