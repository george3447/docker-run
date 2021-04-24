<p align="center">
  <img
    width="160"
    src="https://raw.githubusercontent.com/george3447/docker-run/master/images/icon.png"
    alt="Docker Run - Logo"
  />
</p>

<p align="center">
<a href="https://marketplace.visualstudio.com/items?itemName=george3447.docker-run&ssr=false#overview"
    ><img
      src="https://vsmarketplacebadge.apphb.com/installs-short/george3447.docker-run.svg"
      alt="Installs"
  /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=george3447.docker-run&ssr=false#review-details"
    ><img
      src="https://vsmarketplacebadge.apphb.com/rating-star/george3447.docker-run.svg"
      alt="Rating"
    /></a>
<a href="https://marketplace.visualstudio.com/items?itemName=george3447.docker-run&ssr=false#overview"
    ><img
      src="https://vsmarketplacebadge.apphb.com/version-short/george3447.docker-run.svg"
      alt="Visual Studio Marketplace version"
  /></a>
</p>

<h1 align="center">Docker Run</h1>

<p align="center"> A VS Code Extension for automatically start docker containers required for the current workspace. </p>

![How it works](/images/start-up.gif)

## Why

Currently, there is no way to start docker containers while opening a workspace or switching to another. We may end up with an extra step of running a command or manually starting via UI. This issue can be solved using Docker Run.

## Features

- Automatically start containers for the current workspace
- Automatically stop non-related containers for the current workspace
- Support for start all and stop all containers for current workspace
- Configurable via VS Code settings, `.dockerrc` file and commands
- Control and view container state from the status bar
- Perfect companion extension for [vscode docker](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-docker)

## Installation

To install the extension, open the extensions view, search for `docker run` to filter results and select `Docker Run` extension.

## Usage

- Once installed we can configure the extension using the wizard that will show automatically every time you open a project.

![Initial configuration](/images/first-time-configuration.gif)

- You can see the status of containers and configure the extension via the status bar.

![Status bar](/images/status-bar.gif)

- You can also use commands for configuring the extension

![Commands](/images/commands.gif)

## Changelog

- [https://github.com/george3447/docker-run/blob/master/CHANGELOG.md](https://github.com/george3447/docker-run/blob/master/CHANGELOG.md)

## License

- [https://github.com/george3447/docker-run/blob/master/LICENSE](https://github.com/george3447/docker-run/blob/master/LICENSE)
