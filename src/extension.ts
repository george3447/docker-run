// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { workspace, window, commands, ExtensionContext, DebugConsoleMode, ProgressLocation } from 'vscode';
import * as Docker from 'dockerode';
import { posix } from 'path';
import { ContainerInspectInfo } from 'dockerode';

async function getConfig() {
	if (!workspace.workspaceFolders) {
		return window.showInformationMessage('No folder or workspace opened');
	}

	const folderUri = workspace.workspaceFolders[0].uri;
	const fileUri = folderUri.with({ path: posix.join(folderUri.path, '.dockerrc') });

	if (!fileUri) {
		return window.showInformationMessage('No .dockerrc provided');
	}

	const readData = await workspace.fs.readFile(fileUri);
	const config = JSON.parse(Buffer.from(readData).toString('utf8'));

	if (!config || !config.containers) {
		return window.showInformationMessage('No container names provided');
	}
	return config;
}

function getFormattedName(name: string): string {
	return name[0] === '/' ? name.substring(1) : name;
}

function getContainerLabel(containerInfo: ContainerInspectInfo): string {
	const containerName = getFormattedName(containerInfo.Name);
	const containerImage = containerInfo.Config.Image;
	return `${containerImage} (${containerName})`;
}

async function startAll() {

	const progressOptions = { location: ProgressLocation.Notification, title: 'Starting All Containers' };

	window.withProgress(progressOptions, (async (progress) => {

		const { containers }: { containers: Array<string> } = await getConfig();

		const containersLength = containers.length;

		progress.report({ message: `0/${containersLength}` });

		const docker = new Docker();

		for (let i = 0; i < containersLength; i++) {

			progress.report({ message: `${i + 1}/${containersLength}` });
			const containerId = containers[i];
			const container = docker.getContainer(containerId);

			if (!container) {
				window.showErrorMessage(`No Container With Given Container Id ${containerId} found`);
				continue;
			}

			const containerInfo = await container.inspect();
			const containerLabel = getContainerLabel(containerInfo);

			const { State: { Running } } = containerInfo;

			if (Running) {
				window.showInformationMessage(`Container ${containerLabel} Already Started`);
				continue;
			}

			await container.start();
			window.showInformationMessage(`Successfully Started ${containerLabel}`);

		}
	}));
}

async function stopAll() {

	const progressOptions = { location: ProgressLocation.Notification, title: 'Stopping All Containers' };

	window.withProgress(progressOptions, (async (progress) => {

		const { containers }: { containers: Array<string> } = await getConfig();

		const containersLength = containers.length;

		progress.report({ message: `0/${containersLength}` });

		const docker = new Docker();

		for (let i = 0; i < containersLength; i++) {

			progress.report({ message: `${i + 1}/${containersLength}` });
			const containerId = containers[i];
			const container = docker.getContainer(containerId);

			if (!container) {
				window.showErrorMessage(`No Container With Given Container Id ${containerId} found`);
				continue;
			}

			const containerInfo = await container.inspect();
			const containerLabel = getContainerLabel(containerInfo);

			const { State: { Running } } = containerInfo;

			if (!Running) {
				window.showInformationMessage(`Container ${containerLabel} Already Stopped`);
				continue;
			}

			await container.stop();
			window.showInformationMessage(`Successfully Stopped ${containerLabel}`);

		}
	}));
}

function registerStartAll(context: ExtensionContext) {
	let disposable = commands.registerCommand('docker-run.start:all', async () => {
		await startAll();
	});
	context.subscriptions.push(disposable);
}

function registerStopAll(context: ExtensionContext) {
	let disposableStopAll = commands.registerCommand('docker-run.stop:all', async () => {
		await stopAll();
	});
	context.subscriptions.push(disposableStopAll);
}

export async function activate(context: ExtensionContext) {

	await startAll();

	registerStartAll(context);

	registerStopAll(context);
}

export async function deactivate() {
	await stopAll();
}
