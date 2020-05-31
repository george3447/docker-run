import { ExtensionContext, commands } from 'vscode';

import { initDockerode } from './core/core-utils';
import { isConfigAvailable } from './common/config-utils';
import { disposableAdd } from './commands/add';
import { disposableRemove } from './commands/remove';
import { disposableStartAll } from './commands/start-all';
import { disposableStopAll } from './commands/stop-all';
import { disposableStart } from './commands/start';
import { disposableStop } from './commands/stop';

export async function activate(context: ExtensionContext) {

	initDockerode();

	context.subscriptions.push
		(
			disposableAdd,
			disposableRemove,
			disposableStartAll,
			disposableStopAll,
			disposableStart,
			disposableStop
		);

	if (!isConfigAvailable()) {
		await commands.executeCommand('docker-run.add', true);
	} else {
		await commands.executeCommand('docker-run.start:all');
	}
}

export async function deactivate() {
	await commands.executeCommand('docker-run.stop:all');
}
