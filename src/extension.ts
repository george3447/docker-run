import { ExtensionContext } from 'vscode';

import { initDockerode } from './core/core-utils';
import { isConfigAvailable } from './common/config-utils';
import { registerStartAll, startAll } from './commands/start-all';
import { registerStopAll, stopAll } from './commands/stop-all';
import { registerStop } from './commands/stop';
import { registerStart } from './commands/start';
import { add } from './common/add';
import { registerAdd } from './commands/add';


export async function activate(context: ExtensionContext) {

	initDockerode();

	registerAdd(context);

	registerStart(context);

	registerStop(context);

	registerStartAll(context);

	registerStopAll(context);

	if (!isConfigAvailable()) {
		await add(true);
	}
	await startAll();
}

export async function deactivate() {
	await stopAll();
}
