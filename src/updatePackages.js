import { getManager, allManagers } from './managers';
import { separator } from './log';

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
 * @desc    checks if a changed file should trigger an install
 * @param   {array} files - all changed files
 */
export const checkForUpdates = (files) => {
  const changedFiles = changedFilesToArray(files);
  const managers = [];

  // check if any file from a package manager got changed
  for (const file of changedFiles) {
    for (const manager of allManagers) {
      if (managers.indexOf(manager.name) < 0 && manager.isDependencyFile(file)) {
        managers.push(manager.name);
      }
    }
  }

  // update all managers
  if (managers.length > 0) {
    separator();
    for (const manager of managers) {
      getManager(manager).update();
      separator();
    }
  }
};
