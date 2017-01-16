import fs from 'fs';
import fse from 'fs-extra';
import { gitHooksPath, packagePath } from '../paths';
import { warn, error, separator } from '../log';

const hooks = ['post-checkout', 'post-merge', 'post-rewrite'];
const infoString = 'this file has been automatically generated, please do not edit it';

/**
 * is autoinstaller hook
 *
 * @desc    check if an existing git hook is a previously installed
 *          npm-autoinstaller hook
 * @param   {string} hook - name of the git hook
 * @return  {boolean}
 */
const isAutoinstallerHook = (hook) => {
  const data = fs.readFileSync(`${gitHooksPath}/${hook}`, 'utf8');
  const lines = data.split("\n");

  return lines.length > 2 && lines[2] === '# npm-autoinstaller';
};

/**
 * has already other hooks
 *
 * @desc    checks if there are already git hooks installed which are not
 *          from this package
 * @return  {boolean}
 */
const hasAlreadyOtherHooks = () => {
  for (let hook of hooks) {
    try {
      fs.lstatSync(`${gitHooksPath}/${hook}`);

      if (isAutoinstallerHook(hook)) {
        fse.removeSync(`${gitHooksPath}/${hook}`);
        continue;
      }

      return true;
    } catch (e) {}
  }

  return false;
};

/**
 * replace hook in file
 *
 * @desc  replaces the {HOOK} placeholder in a hook file
 * @param {string} hook - name of the git hook
 */
const replaceHookInFile = (hook) => {
  const filename = `${gitHooksPath}/${hook}`;
  const file = fs.readFileSync(filename, 'utf8');
  let replacedFile = file.replace(/\{HOOK\}/g, hook);
  replacedFile = replacedFile.replace(/\{INFO\}/g, infoString);

  fs.writeFileSync(filename, replacedFile, 'utf8');
};

/**
 * copy hooks
 *
 * @desc  copyies the hook template over to the git hooks directory
 */
const copyHooks = () => {
  for (let hook of hooks) {
    try {
      fse.copySync(`${packagePath}/dist/hooks/hook-template.sh`, `${gitHooksPath}/${hook}`);
      replaceHookInFile(hook);
    } catch (e) {
      separator();
      error('npm-autoinstaller could not be installed:');
      error('could not copy git hooks!');
      error(e);
      separator();
      return;
    }
  }
};

/**
 * install hooks
 *
 * @desc  installs all available git hooks
 */
const installHooks = () => {
  fs.lstat(gitHooksPath, (err, stats) => {
    if (err || !stats.isDirectory()) {
      separator();
      error('npm-autoinstaller could not be installed:');
      error('git hooks directory not found!');
      error('this directory is most likely not a git repository.');
      separator();
    } else if (hasAlreadyOtherHooks()) {
      separator();
      error('npm-autoinstaller could not be installed:');
      error('it seems like you already have some git hooks installed.');
      error('if you are using (or have used) another git-hooks package, please read:');
      error('https://github.com/cyrilwanner/npm-autoinstaller/blob/master/MIGRATING.md'.underline);
      separator();
    } else {
      copyHooks();
    }
  });
};

module.exports = installHooks;
