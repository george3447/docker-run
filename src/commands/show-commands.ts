import { commands, window } from 'vscode';

import { dockerRunCommandList } from '../common/constants';
import * as messages from '../common/messages';

export const disposableShowCommand = commands.registerCommand('docker-run.show-commands', async () => {
  const selectedCommand = await window.showQuickPick(dockerRunCommandList, {
    canPickMany: false,
    placeHolder: messages.DOCKER_RUN_COMMANDS
  });

  if (selectedCommand && selectedCommand.id) {
    commands.executeCommand(selectedCommand.id);
  }
});
