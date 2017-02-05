import { execSync } from 'child_process';
import { askForInstall } from './input';
import { info, warn, error } from './log';

/**
 * package manager class
 */
export class Manager {
  constructor(name, config) {
    this.name = name;

    if (config && typeof config.command !== 'undefined' && typeof config.files !== 'undefined') {
      this.loadFromConfig(config);
    } else {
      throw new Error('can not load manager from config');
    }
  }

  /**
   * load from config
   *
   * @desc  load the configuration for the manager
   */
  loadFromConfig(config) {
    this.action = config.do;
    this.command = config.command;
    this.files = Array.isArray(config.files) ? config.files : [config.files];

    // use the fallback action if the shell is not interactive
    if (this.action === 'ask' && !process.stdout.isTTY) {
      this.action = config.fallback;
    }

    if (typeof this.action === 'undefined') {
      this.action = 'install';
    }
  }

  /**
   * is disabled
   *
   * @desc    check if the manager is currently disabled
   * @return  {boolean}
   */
  isDisabled() {
    return !this.action || this.action === 'disabled';
  }

  /**
   * is dependency file
   *
   * @desc    check if the file defines the dependencies of this manager
   * @return  {boolean}
   */
  isDependencyFile(file) {
    return this.files.indexOf(file) >= 0;
  }

  /**
   * update
   *
   * @desc  installs the new packages or asks/warns about it, depending on the configured action
   */
  update() {
    // check if it is disabled
    if (this.isDisabled()) {
      return;
    }

    // warn the user that the packages have changed but do nothing
    if (this.action === 'warn') {
      warn(`${this.name} packages have changed but are not updated automatically`);
      warn(`you may need to run '${this.command}' manually if your app requires the new versions of the packages`);

    // install the packages
    } else if (this.action === 'install' || this.action === 'update') {
      info(`${this.name} packages have changed, installing the updated packages..`);
      this.executeCommand();

    // ask if the packages should get installed
    } else if (this.action === 'ask') {
      info(`${this.name} packages have changed, do you want to install the new versions?`);

      if (askForInstall()) {
        info('installing updated packages..');
        this.executeCommand();
      } else {
        info('updated packages won\'t get installed');
      }
    }
  }

  /**
   * execute command
   *
   * @desc  execute the defined install command
   */
  executeCommand() {
    try {
      execSync(this.command);
    } catch(e) {
      if (e.toString().indexOf('command not found') >= 0) {
        error(`the command '${this.command.split(' ')[0]}' could not be found`);
        error('please install it globally or update the install command in the npm-autoinstaller config');
      } else {
        error(e);
        error('packages could not be installed');
      }
    }
  }
}
