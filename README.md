npm-autoinstaller [![npm version](https://badge.fury.io/js/npm-autoinstaller.svg)](https://www.npmjs.com/package/npm-autoinstaller) [![Build Status](https://travis-ci.org/cyrilwanner/npm-autoinstaller.svg?branch=master)](https://travis-ci.org/cyrilwanner/npm-autoinstaller)
=========

Ensures that you'll always be up to date with your dependencies.
Useful if you are working on a team and your package.json changes a lot, e.g. when using [greenkeeper.io](https://greenkeeper.io/).

You'll never have to run `npm install` again!

## Table of contents

* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Other package managers (bower, yarn, ...)](#other-package-managers-bower-yarn-)
* [User Configs](#user-configs)
* [Migrating](#migrating)
* [Windows Support](#windows-support)
* [Support](#support)
* [License](#license)

## Installation

`npm install --save-dev npm-autoinstaller`

## Usage

After installing, you are already set. The script installs the required [git-hooks](https://git-scm.com/book/it/v2/Customizing-Git-Git-Hooks) and runs automatically `npm install` once your package.json has changed to ensure that you are always up to date with your dependencies!

Currently supported git actions:

* `pull`
* `merge`
* `checkout`
* `rewrite/rebase`

## Configuration

You can of course configure how the script should handle package changes.
The configuration itself is also done in the package.json. You can add the following object to it (these are the [default values](https://github.com/cyrilwanner/npm-autoinstaller/blob/master/src/config.js#L8)):

```js
"autoinstaller": {
  "npm": {
    "do": "install",
    "fallback": "install",
    "command": "npm prune && npm install",
    "files": ["package.json"],
    "excludedFolders": ["node_modules"]
  },
  "bower": {...}
}
```

With the `do` property, you specify what action should be executed if the packages have changed. The following actions are available:

* `install`: just installs the packages
* `ask`: if the packages have changed, the user gets prompted and can decide if he wants to install them
* `warn`: only a warning message will get displayed that the packages have changed but they don't get installed automatically
* `nothing` (or `false`): ignore updated packages

If you choose `ask`, you can specify a fallback action in the `fallback` property.
The fallback will get used if the user is not in an interactive shell (e.g. git pull was called from a script or a GUI like SourceTree is used).

With the `command` property, you can change the command which gets executed if a change has been detected.
The command gets executed in the folder where the definition file (e.g. package.json) is located. So if you have `frontend/package.json`, it will change the current directory to `frontend` and execute the command there.
Also, if you have a multi-package repository and have multiple package.json files, it will execute the command in all folders where the package.json got changed.

If you have a different setup or don't use the default package.json location or name, you can change the `files` property. It will automatically look for changes of all files in this array.

Note: The `files` property is recursive by default, so it will also check for a package.json in any subdirectory (except if it is in a folder specified in `excludedFolders`), which is useful if the frontend part is in a dedicated subfolder or you have a multi-package repository.
If you don't want this, start your definitions with a `^` (e.g. `^package.json` or `^frontend/package.json`), this will only look for the file in the root folder of your project.

You can also take a look at [User Configs](#user-configs) if you want to change a config just for yourself and not for all contributors.

## Other package managers (bower, yarn, ...)

npm-autoinstaller supports these package- or dependency managers out of the box: `npm`, `bower` and `composer`.
You can also change their config in the package.json accordingly to the npm example.

If you use `yarn`, `ied` or something similar, that's also not a problem. Just change the install command in the config like this:
```json
"npm": {
  "command": "yarn install"
}
```

You can even add any other dependency manager by yourself. Just add a new entry in the config object, specify which files it should look for changes and which command it should execute for updating the dependencies.

## User Configs

You may not want to force all team members to use the same config of this package. For example, you use yarn for yourself but won't force everyone else to use it or you want just to be warned about package changes and not update them automatically like it is configured in the package.json.

To solve this problem, you can use a user config file which you don't check in to your git repository and still suggest the default config for your team in the package.json. By default, npm-autoinstaller will also look for a `autoinstaller.json` file in the root directory of your project. If this exists, it will override the default config from the package.json. You may also want to add this file to your .gitignore and keep your overrides for yourself.

If you don't want any configuration in the package.json at all, you can check in the `autoinstaller.json` file to git and specify a `userConfig` key within it (with a filename as the value, e.g. `autoinstaller.local.json`) to still allow user configs.

## Migrating

If you already use another package with git-hooks in your project, you may receive this message during installation: `it seems like you already have some git hooks installed.`.
If this is the case, please read the [MIGRATING.md](https://github.com/cyrilwanner/npm-autoinstaller/blob/master/MIGRATING.md)

## Windows support

This package has only basic windows support. This means, if you are in a bash like environment (`git bash` or `Cygwin`) and you are using the git cli,
it should work fine except the `ask` action because there is no way to tell if the shell is interactive or not. So it will always use the fallback action in this case.

Also, GUIs (like SourceTree or GitHub for Windows) are supported, _if_ you have installed node in the default location.
Because these applications use a custom PATH when executing the git commands in the background, the npm-autoinstaller has to guess the location of the node executable.

## Support

Something is not working or you have a question? Simply create a [new issue](https://github.com/cyrilwanner/npm-autoinstaller/issues/new)!

## License

[MIT](https://github.com/cyrilwanner/npm-autoinstaller/blob/master/LICENSE) © Cyril Wanner

