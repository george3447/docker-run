import { ExtensionContext, commands } from 'vscode';

import { initDockerode, initContainerOperations, initAutoAdd, initAutoStart } from './core/core-utils';
import { isConfigAvailable } from './common/config-utils';
import { disposableAdd } from './commands/add';
import { disposableRemove } from './commands/remove';
import { disposableStartAll } from './commands/start-all';
import { disposableStopAll } from './commands/stop-all';
import { disposableStart } from './commands/start';
import { disposableStop } from './commands/stop';
import { handleError } from './common/error-utils';
import { disposableStopNonRelated } from './commands/stop-non-related';

export async function activate(context: ExtensionContext) {

	initDockerode();

	initContainerOperations();

	context.subscriptions.push
		(
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
