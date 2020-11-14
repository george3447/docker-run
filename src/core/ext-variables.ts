import Dockerode = require("dockerode");

import { StartOperation, StopOperation, StopNonRelatedOperation } from "./operations";

export namespace ext {
    export let dockerode: Dockerode;
    export let startOperation: StartOperation;
    export let stopOperation: StopOperation;
    export let stopNonRelatedOperation: StopNonRelatedOperation;
}