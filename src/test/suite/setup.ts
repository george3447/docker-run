import { initDockerode } from '../../core/core';
import { ext } from '../../core/ext-variables';
import { testImage } from '../utils/container';

suiteSetup((done) => {
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
    await ext.dockerode.getImage(testImage).remove();
});