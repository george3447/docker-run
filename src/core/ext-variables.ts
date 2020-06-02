import Dockerode = require("dockerode");
import { ContainerOperation } from "../common/container-operation";

export namespace ext {
    export let dockerode: Dockerode;
    export let startOperation: ContainerOperation;
    export let stopOperation: ContainerOperation;
    export let stopNonRelatedOperation: ContainerOperation;
}