import fs from 'fs';
import { gitHooksPath, packagePath } from '../paths';
import { error, separator } from '../log';

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
export const isAutoinstallerHook = (hook) => {
  const data = fs.readFileSync(`${gitHooksPath}/${hook}`, 'utf8');
  const lines = data.split("\n");

  return lines.length > 2 && lines[2].startsWith('# npm-autoinstaller');
};

/**
 * has already other hooks
 *
 * @desc    checks if there are already git hooks installed which are not
 *          from this package
 * @return  {boolean}
 */
export const hasAlreadyOtherHooks = () => {
  for (let hook of hooks) {
    if (fs.existsSync(`${gitHooksPath}/${hook}`)) {
      if (isAutoinstallerHook(hook)) {
        fs.unlinkSync(`${gitHooksPath}/${hook}`);
        continue;
      }

      return true;
    }
  }

  return false;
};

/**
 * replace hook in string
 *
 * @desc  replaces the {HOOK} placeholder in a string
 * @param {string} content - string in which the hook should get replaced
 * @param {string} hook - name of the git hook
 * @return {string}
 */
export const replaceHookInString = (content, hook) => {
  const replacedString = content.replace(/\{HOOK\}/g, hook);
  return replacedString.replace(/\{INFO\}/g, infoString);
};

/**
 * copy hooks
 *
 * @desc  copyies the hook template over to the git hooks directory
 */
export const copyHooks = () => {
  for (let hook of hooks) {
    try {
      const content = fs.readFileSync(`${packagePath}/dist/hooks/hook-template.sh`, 'utf8');
      fs.writeFileSync(`${gitHooksPath}/${hook}`, replaceHookInString(content, hook));
      fs.chmodSync(`${gitHooksPath}/${hook}`, '755');
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
 * @param {function} callback - optional callback function
 */
export const installHooks = (callback) => {
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

    if (typeof callback === 'function') {
      callback();
    }
  });
};
