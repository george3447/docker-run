import { SinonStub, stub } from 'sinon';

import { initDockerode } from '../../core/core';
import { ext } from '../../core/ext-variables';
import { testImage } from '../utils/container';

let stubConsoleWarn: SinonStub;

suiteSetup((done) => {
    stubConsoleWarn = stub(console, 'warn');
    initDockerode();
    ext.dockerode.pull(testImage, {}, (err, stream) => {
        if (err) { return done(err); }
        stream.pipe(process.stdout);
        stream.once('end', async () => {
            done();
        });
    });
});

suiteTeardown(async () => {
    stubConsoleWarn.restore();
});