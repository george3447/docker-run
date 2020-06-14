import Dockerode = require("dockerode");

import { StartOperation } from "./operations/start-operation";
import { StopOperation } from "./operations/stop-operation";
import { StopNonRelatedOperation } from "./operations/stop-non-related-operation";

export namespace ext {
    export let dockerode: Dockerode;
    export let startOperation: StartOperation;
    export let stopOperation: StopOperation;
    export let stopNonRelatedOperation: StopNonRelatedOperation;
}