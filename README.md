npm-autoinstaller
=========

Ensures that you'll always be up to date with your dependencies.
Useful if you are working on a team and your package.json changes a lot, e.g. when using [greenkeeper.io](https://greenkeeper.io/).

You'll never have to run `npm install` again!

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
  ```json
    "autoinstaller": {
      "npm": {
        "do": "install",
        "fallback": "install",
        "command": "npm install"
      }
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

## Migrating

  If you already use another package with git-hooks in your project, you may receive this message during installation: `it seems like you already have some git hooks installed.`.
  If this is the case, please read the [MIGRATING.md](https://github.com/cyrilwanner/npm-autoinstaller/blob/master/MIGRATING.md)

## Support

  Something is not working or you have a question? Simply create a new issue!
