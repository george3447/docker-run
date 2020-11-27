import { commands, ExtensionContext } from 'vscode';

import { disposableAdd } from './commands/add';
import { disposableRemove } from './commands/remove';
import { disposableStart } from './commands/start';
import { disposableStartAll } from './commands/start-all';
import { disposableStop } from './commands/stop';
import { disposableStopAll } from './commands/stop-all';
import { disposableStopNonRelated } from './commands/stop-non-related';
import { isConfigAvailable } from './common/config';
import { handleError } from './common/error';
import { initAutoAdd, initAutoStart, initContainerOperations, initDockerode } from './core/core';

export async function activate(context: ExtensionContext) {
  initDockerode();

  initContainerOperations();

  context.subscriptions.push(
    disposableAdd,
    disposableRemove,
    disposableStartAll,
    disposableStopAll,
    disposableStopNonRelated,
    disposableStart,
    disposableStop
  );

  if (!isConfigAvailable()) {
    await initAutoAdd().catch(handleError);
  } else {
    await initAutoStart().catch(handleError);
  }
}

export async function deactivate() {
  await commands.executeCommand('docker-run.stop:all');
}
