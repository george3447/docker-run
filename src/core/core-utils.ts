import * as Dockerode from 'dockerode';
import { DockerOptions } from "dockerode";

import { ext } from "./ext-variables";

export function initDockerode(options?: DockerOptions) {
    ext.dockerode = new Dockerode(options);
}