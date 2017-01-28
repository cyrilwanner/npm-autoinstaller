import readlineSync from 'readline-sync';
import { info, prefix } from './log';

/**
 * ask for install
 *
 * @desc    ask the user if he wants to install new packages
 * @param   {boolean} recursive - if it should recursively ask the user for an answer if it was invalid (optional)
 * @return  {boolean}
 */
export const askForInstall = (recursive = true) => {
  const response = readlineSync.question(`${prefix.gray} > (Y/n) `);

  if (response === '' || response.toLowerCase() === 'y' || response.toLowerCase() === 'yes') {
    return true;
  } else if (response.toLowerCase() === 'n' || response.toLowerCase() === 'no') {
    return false;
  }

  info('invalid input');

  if (recursive) {
    return askForInstall();
  } else {
    throw new Error('invalid answer');
  }
};
