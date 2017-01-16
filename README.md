npm-autoinstaller [![npm version](https://badge.fury.io/js/npm-autoinstaller.svg)](https://www.npmjs.com/package/npm-autoinstaller)
=========

Ensures that you'll always be up to date with your dependencies.
Useful if you are working on a team and your package.json changes a lot, e.g. when using [greenkeeper.io](https://greenkeeper.io/).

You'll never have to run `npm install` again!

## Table of contents

* [Installation](#installation)
* [Usage](#usage)
* [Configuration](#configuration)
* [Other package managers (bower, yarn, ...)](#other-package-managers-bower-yarn-)
* [Migrating](#migrating)
* [Windows Support](#windows-support)
* [Support](#support)

## Installation

`npm install --save-dev npm-autoinstaller`

## Usage

After installing, you are already set. The script installs the required [git-hooks](https://git-scm.com/book/it/v2/Customizing-Git-Git-Hooks) and runs automatically `npm install` once your package.json has been changed to ensure that you are always up to date with your dependencies!

Currently supported git actions:

* `pull`
* `merge`
* `checkout`
* `rewrite/rebase`

## Configuration

You can of course configure how the script should handle package changes.
The configuration itself is also done in the package.json. You can add the following object to it (these are the default values):

```js
"autoinstaller": {
  "npm": {
    "do": "install",
    "fallback": "install",
    "command": "npm install",
    "files": ["package.json"]
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

If you have a different setup or don't use the default package.json location or name, you can change the `files` property. It will automatically look for changes of all files in this array.

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
