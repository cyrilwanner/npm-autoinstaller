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
  
    * pull
    * merge
    * checkout
    * rewrite/rebase

## Migrating

  If you already use another package with git-hooks in your project, you may receive this message during installation: `it seems like you already have some git hooks installed.`.
  If this is the case, please read the [MIGRATING.md](MIGRATING.md)

## Support

  Something is not working or you have a question? Simply create a new issue!
