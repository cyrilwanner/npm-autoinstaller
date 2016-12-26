import { execSync } from 'child_process';
import { info, separator } from './log';

/**
 * changed files to array
 *
 * @desc    converts the output of the diff commands to an array
 * @param   {string}  files - string with all files
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
 * @param   {array} - files - all changed files
 */
export const checkForUpdates = (files) => {
  const changedFiles = changedFilesToArray(files);
  let shouldUpdate = false;

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
 * update packages
 *
 * @desc  runs 'npm install'
 */
export const updatePackages = () => {
  separator();
  info('packages have changed, installing updated node modules..');
  execSync('npm install');
  separator();
};
