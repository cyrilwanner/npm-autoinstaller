import { execSync } from 'child_process';
import { config } from './config';
import { askForInstall } from './input';
import { info, warn, error } from './log';

/**
 * package manager class
 */
export class Manager {
  constructor(name) {
    this.name = name;

    if (config[name] && typeof config[name].do !== 'undefined' &&
        typeof config[name].fallback !== 'undefined' &&
        typeof config[name].command !== 'undefined' &&
        typeof config[name].files !== 'undefined') {
      this.loadFromConfig();
    } else {
      throw new Exception('can not load manager from config');
    }
  }

  /**
   * load from config
   *
   * @desc  load the configuration for the manager
   */
  loadFromConfig() {
    this.action = config[this.name].do;
    this.command = config[this.name].command;
    this.files = Array.isArray(config[this.name].files) ? config[this.name].files : [config.this.name].files;

    // use the fallback action if the shell is not interactive
    if (this.action === 'ask' && !process.stdout.isTTY) {
      this.action = config[this.name].fallback;
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
