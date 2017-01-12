import { execSync } from 'child_process';
import readlineSync from 'readline-sync';
import { info, warn, separator, prefix } from './log';
import { config } from './config';

/**
 * changed files to array
 *
 * @desc    converts the output of the diff commands to an array
 * @param   {string} files - string with all files
 * @return  {array}
 */
export const changedFilesToArray = (files) => {
  let changedFiles = files;
  if (typeof changedFiles === 'string') {
    changedFiles = changedFiles.split('\n');
  }

  return changedFiles;
};

/**
 * check for updates
 *
 * @desc    checks if a changed file should trigger an npm install
 * @param   {array} files - all changed files
 */
export const checkForUpdates = (files) => {
  const changedFiles = changedFilesToArray(files);
  let shouldUpdate = false;

  // check if the package.json file got changed
  for (const file of changedFiles) {
    if (file === 'package.json') {
      shouldUpdate = true;
    }
  }

  if (shouldUpdate) {
    updatePackages();
  }
};

/**
 * ask for install
 *
 * @desc    ask the user if he wants to install the new versions of the packages
 * @return  {boolean}
 */
const askForInstall = () => {
  const response = readlineSync.question(`${prefix.gray} > [Y/n] `);

  if (response === '' || response.toLowerCase() === 'y' || response.toLowerCase() === 'yes') {
    return true;
  } else if (response.toLowerCase() === 'n' || response.toLowerCase() === 'no') {
    return false;
  }

  info('invalid input');
  return askForInstall();
};

/**
 * update packages
 *
 * @desc  runs 'npm install'
 */
export const updatePackages = () => {
  let action = config.npm.do;

  // use the fallback action if the shell is not interactive
  if (action === 'ask' && !process.stdout.isTTY) {
    action = config.npm.fallback;
  }

  // check if it is disabled
  if (!action || action === 'nothing') {
    info('disabled');
    return;
  }

  separator();

  // warn the user that the packages have changed but do nothing
  if (action === 'warn') {
    warn('packages have changed but are not updated automatically');
    warn(`you may need to run '${config.npm.command}' manually if your app requires the new versions of the packages`);

  // install the packages
  } else if (action === 'install' || action === 'update') {
    info('packages have changed, installing updated node modules..');
    execSync(config.npm.command);

  // ask if the packages should get installed
  } else if (action === 'ask') {
    info('packages have changed, do you want to install the new versions?');

    if (askForInstall()) {
      info('installing updated node modules..');
      execSync(config.npm.command);
    } else {
      info('updated node modules won\'t get installed');
    }
  }

  separator();
};
