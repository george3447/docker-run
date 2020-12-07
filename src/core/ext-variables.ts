import Dockerode = require('dockerode');
import { StatusBarItem } from 'vscode';

import { StartOperation, StopNonRelatedOperation, StopOperation } from './operations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ext {
  export let dockerode: Dockerode;
  export let startOperation: StartOperation;
  export let stopOperation: StopOperation;
  export let stopNonRelatedOperation: StopNonRelatedOperation;
  export let statusBarItem: StatusBarItem | null;
  export let statusBarItemRefreshTimer: NodeJS.Timeout;
}
