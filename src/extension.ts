// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ProgressLocation, workspace, window, commands, ExtensionContext } from 'vscode';
import { posix } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

async function extractConfig() {
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

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {


	const { containers }: { containers: Array<string> } = await extractConfig();


	const asyncExec = promisify(exec);

	for (const container of containers) {
		const { stderr, stdout }: any = await asyncExec(`docker start ${container}`)
			.catch((err) => {
				if (err) {
					console.log('error: ' + err);
					return window.showErrorMessage(`Failed To Start Docker Container ${container}`);
				}
			});

		if (stderr) {
			console.log('stderr: ' + stderr);
			return window.showErrorMessage(`Failed To Start Docker Container ${container}, error: ${stderr}`);
		}
		console.log('success: ' + stdout);
		const { stdout: containerInfo }: any = await asyncExec(`docker inspect --format='{{.Config.Image}}({{.Name}})' ${container}`);

		window.showInformationMessage(`Successfully Started The Container ${containerInfo}`);

	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "docker-run" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = commands.registerCommand('docker-run.start', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		window.showInformationMessage('docker-run extension started');
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export async function deactivate() {
	const { containers }: { containers: Array<string> } = await extractConfig();

	containers.forEach((container) => {
		exec(`docker stop ${container}`, (err, stdout, stderr) => {
			if (err) {
				console.log('error: ' + err);
				return window.showErrorMessage(`Failed to stop docker container ${container}`);
			}
			if (stderr) {
				console.log('stderr: ' + stderr);
				return window.showErrorMessage(`Failed to stop docker container ${container}, error: ${stderr}`);
			}
			console.log('success: ' + stdout);
			window.showInformationMessage(`Successfully stopped the container ${container}`);
		});
	});
}
