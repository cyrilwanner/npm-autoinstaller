import fs from 'fs';
import path from 'path';
import { getGitHooksPath, packagePath } from '../paths';
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
  const data = fs.readFileSync(`${getGitHooksPath()}/${hook}`, 'utf8');
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
    if (fs.existsSync(`${getGitHooksPath()}/${hook}`)) {
      if (isAutoinstallerHook(hook)) {
        fs.unlinkSync(`${getGitHooksPath()}/${hook}`);
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
export const replaceHookInString = (content, hook, relativePath) => {
  let replacedString = content.replace(/\{HOOK\}/g, hook);
  replacedString = replacedString.replace(/\{INFO\}/g, infoString);
  replacedString = replacedString.replace(/\{PATH}/g, relativePath);
  return replacedString;
};

/**
 * copy hooks
 *
 * @desc  copyies the hook template over to the git hooks directory
 */
export const copyHooks = () => {
  for (let hook of hooks) {
    try {
      const relativePath = path.relative(getGitHooksPath(), __dirname);
      const content = fs.readFileSync(`${packagePath}/dist/hooks/hook-template.sh`, 'utf8');
      fs.writeFileSync(`${getGitHooksPath()}/${hook}`, replaceHookInString(content, hook, relativePath));
      fs.chmodSync(`${getGitHooksPath()}/${hook}`, '755');
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
  const gitHooksPath = getGitHooksPath();

  if (!gitHooksPath) {
    separator();
    error('npm-autoinstaller could not be installed:');
    error('git hooks directory not found!');
    error('this directory is most likely not a git repository.');
    separator();
  } else {
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
  }
};
