import readlineSync from 'readline-sync';
import { info, prefix } from './log';

/**
 * ask for install
 *
 * @desc    ask the user if he wants to install new packages
 * @return  {boolean}
 */
export const askForInstall = () => {
  const response = readlineSync.question(`${prefix.gray} > (Y/n) `);

  if (response === '' || response.toLowerCase() === 'y' || response.toLowerCase() === 'yes') {
    return true;
  } else if (response.toLowerCase() === 'n' || response.toLowerCase() === 'no') {
    return false;
  }

  info('invalid input');
  return askForInstall();
};
