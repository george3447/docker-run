import Dockerode = require('dockerode');

import { StartOperation, StopNonRelatedOperation, StopOperation } from './operations';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ext {
  export let dockerode: Dockerode;
  export let startOperation: StartOperation;
  export let stopOperation: StopOperation;
  export let stopNonRelatedOperation: StopNonRelatedOperation;
}
