import { SinonStub, stub } from 'sinon';

import { initDockerode } from '../../core/core';
import { ext } from '../../core/ext-variables';
import { testImage } from '../utils/container';

let stubConsoleWarn: SinonStub;

suiteSetup((done) => {
  initDockerode();
  ext.dockerode.pull(testImage, {}, (err, stream) => {
    if (err) {
      return done(err);
    }
    stream.pipe(process.stdout);
    stream.once('end', async () => {
      done();
    });
  });
});

setup(() => {
  stubConsoleWarn = stub(console, 'warn');
});

teardown(() => {
  stubConsoleWarn.restore();
});
