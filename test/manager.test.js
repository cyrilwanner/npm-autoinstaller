import path from 'path';
import chai, { expect, spy } from 'chai';
import spies from 'chai-spies-next';
import proxyquire from 'proxyquire';

chai.use(spies);

let infoSpy;
let warnSpy;
let errorSpy;
let execSpy;
let askSpy;

const config = {
  valid: {
    do: 'ask',
    fallback: 'warn',
    command: 'npm prune && npm install',
    files: ['package.json'],
  },
  install: {
    do: 'install',
    command: 'npm install',
    files: ['package.json'],
  },
  warn: {
    do: 'warn',
    command: 'npm install',
    files: ['package.json']
  },
  ask: {
    do: 'ask',
    fallback: 'ask',
    command: 'npm install',
    files: ['packages.json'],
  },
  filesArray: {
    command: 'npm install',
    files: 'package.json',
  },
  defaultAction: {
    command: 'npm install',
    files: ['package.json'],
  },
  ttyDefaultAction: {
    do: 'ask',
    command: 'npm install',
    files: ['package.json'],
  },
  disabled1: {
    do: false,
    command: 'npm install',
    files: ['package.json'],
  },
  disabled2: {
    do: 'disabled',
    command: 'npm install',
    files: ['package.json'],
  },
  disabled3: {
    do: null,
    command: 'npm install',
    files: ['package.json'],
  },
  dependencyFile: {
    command: 'npm install',
    files: ['package.json', 'test/package2.json'],
  },
  invalid1: {
    command: 'npm install',
  },
  invalid2: {
    files: ['package.json'],
  },
  invalid3: {
    do: 'ask',
  },
  excludedFolders1: {
    command: 'npm prune && npm install',
    files: ['package.json'],
    excludedFolders: ['node_modules'],
  },
  excludedFolders2: {
    command: 'npm prune && npm install',
    files: ['package.json', 'package2.json'],
    excludedFolders: ['node_modules', 'vendor'],
  },
  rootDir1: {
    command: 'npm prune && npm install',
    files: ['^package.json'],
    excludedFolders: ['node_modules'],
  },
  rootDir2: {
    command: 'npm prune && npm install',
    files: ['^package.json', 'package2.json'],
    excludedFolders: ['node_modules', 'vendor'],
  },
  multipleContextsInstall: {
    do: 'install',
    command: 'npm install',
    files: ['package.json'],
  },
  multipleContextsWarn: {
    do: 'warn',
    command: 'npm install',
    files: ['package.json'],
  },
};

const packages = {
  './log': {
    info: (...args) => infoSpy(...args),
    warn: (...args) => warnSpy(...args),
    error: (...args) => errorSpy(...args)
  },
  './input': {
    askForInstall: (...args) => askSpy(...args)
  },
  child_process: {
    execSync: (...args) => execSpy(...args)
  }
};

const { Manager } = proxyquire('../dist/manager', packages);

describe('manager', () => {
  beforeEach(() => {
    infoSpy = spy();
    warnSpy = spy();
    errorSpy = spy();
    execSpy = spy();
  });

  it('creates a new manager with a valid config', () => {
    const manager = new Manager('valid', config.valid);

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.name).to.equal('valid');
    expect(manager.command).to.equal('npm prune && npm install');
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('does not accept invalid configs', () => {
    expect(() => new Manager('invalid1', config.invalid1)).to.throw('can not load manager from config');
    expect(() => new Manager('invalid2', config.invalid2)).to.throw('can not load manager from config');
    expect(() => new Manager('invalid3', config.invalid3)).to.throw('can not load manager from config');
    expect(() => new Manager('invalid4', config.invalid4)).to.throw('can not load manager from config');
  });

  it('converts files to an array', () => {
    const manager = new Manager('filesArray', config.filesArray);

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('falls back to a default action', () => {
    const manager = new Manager('defaultAction', config.defaultAction);

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.action).to.equal('install');
    expect(manager.command).to.equal('npm install');
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('uses the fallback action if the terminal does not support TTY', () => {
    process.stdout.isTTY = true;
    const manager1 = new Manager('valid', config.valid);

    expect(manager1).to.be.an.instanceof(Manager);
    expect(manager1.action).to.equal('ask');

    process.stdout.isTTY = false;
    const manager2 = new Manager('valid', config.valid);

    expect(manager2).to.be.an.instanceof(Manager);
    expect(manager2.action).to.equal('warn');

    const manager3 = new Manager('ttyDefaultAction', config.ttyDefaultAction);

    expect(manager3).to.be.an.instanceof(Manager);
    expect(manager3.action).to.equal('install');
  });

  it('checks if the manager is disabled', () => {
    const manager1 = new Manager('disabled1', config.disabled1);

    expect(manager1).to.be.an.instanceof(Manager);
    expect(manager1.isDisabled()).to.equal(true);

    const manager2 = new Manager('disabled2', config.disabled2);

    expect(manager2).to.be.an.instanceof(Manager);
    expect(manager2.isDisabled()).to.equal(true);

    const manager3 = new Manager('disabled3', config.disabled3);

    expect(manager3).to.be.an.instanceof(Manager);
    expect(manager3.isDisabled()).to.equal(true);

    const manager4 = new Manager('valid', config.valid);

    expect(manager4).to.be.an.instanceof(Manager);
    expect(manager4.isDisabled()).to.equal(false);

    const manager5 = new Manager('install', config.install);

    expect(manager5).to.be.an.instanceof(Manager);
    expect(manager5.isDisabled()).to.equal(false);

    const manager6 = new Manager('warn', config.warn);

    expect(manager6).to.be.an.instanceof(Manager);
    expect(manager6.isDisabled()).to.equal(false);
  });

  it('checks if a file is handled by this manager', () => {
    const manager = new Manager('dependencyFile', config.dependencyFile);

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('package.js')).to.equal(false);
    expect(manager.isDependencyFile('test')).to.equal(false);
    expect(manager.isDependencyFile('test/package.json')).to.equal(true);
    expect(manager.isDependencyFile('test\\package.json')).to.equal(true);
    expect(manager.isDependencyFile('package2.json')).to.equal(false);
    expect(manager.isDependencyFile('test/package2.json')).to.equal(true);
    expect(manager.isDependencyFile('test\\package2.json')).to.equal(true);
  });

  it('handles the install action correctly', () => {
    const manager = new Manager('install', config.install);
    manager.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.once;
    expect(infoSpy).to.have.been.called.with('install packages have changed, installing the updated packages..');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm install');
  });

  it('handles the warn action correctly', () => {
    const manager = new Manager('warn', config.warn);
    manager.update();

    expect(warnSpy).to.have.been.called();
    expect(warnSpy).to.have.been.called.twice;
    expect(warnSpy).to.have.been.called.with('warn packages have changed but are not updated automatically');
    expect(warnSpy).to.have.been.called.with(`you may need to run 'npm install' manually if your app requires the new versions of the packages`);
    expect(infoSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('handles the ask action correctly', () => {
    askSpy = (...args) => true;

    const manager1 = new Manager('ask', config.ask);
    manager1.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.twice;
    expect(infoSpy).to.have.been.called.with('ask packages have changed, do you want to install the new versions?');
    expect(infoSpy).to.have.been.called.with('installing updated packages..');
    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm install');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();

    infoSpy = spy();
    execSpy = spy();
    askSpy = (...args) => false;

    const manager2 = new Manager('ask', config.ask);
    manager2.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.twice;
    expect(infoSpy).to.have.been.called.with('ask packages have changed, do you want to install the new versions?');
    expect(infoSpy).to.have.been.called.with('updated packages won\'t get installed');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('handles a disabled action correctly', () => {
    const manager = new Manager('disabled1', config.disabled1);
    manager.update();

    expect(infoSpy).to.not.have.been.called();
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('executes the correct command', () => {
    const manager1 = new Manager('valid', config.valid);
    manager1.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm prune && npm install');

    execSpy = spy();

    const manager2 = new Manager('install', config.install);
    manager2.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm install');
  });

  it('handles invalid commands', () => {
    execSpy = spy((...args) => {
      throw new Error('custom-error');
    });

    const manager1 = new Manager('valid', config.valid);
    manager1.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm prune && npm install');
    expect(errorSpy).to.have.been.called();
    expect(errorSpy).to.have.been.called.twice;
    expect(errorSpy).to.have.been.called.with('packages could not be installed');

    execSpy = spy((...args) => {
      throw new Error('asdf command not found');
    });
    errorSpy = spy();

    const manager2 = new Manager('valid', config.valid);
    manager2.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm prune && npm install');
    expect(errorSpy).to.have.been.called();
    expect(errorSpy).to.have.been.called.twice;
    expect(errorSpy).to.have.been.called.with(`the command 'npm' could not be found`);
    expect(errorSpy).to.have.been.called.with('please install it globally or update the install command in the npm-autoinstaller config');
  });

  it('handles excluded folders', () => {
    const manager = new Manager('excludedFolders1', config.excludedFolders1);
    
    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('subdir/package.json')).to.equal(true);
    expect(manager.isDependencyFile('node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/test-package/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/test-package/package.json')).to.equal(true);
    expect(manager.isDependencyFile('subdir\\package.json')).to.equal(true);
    expect(manager.isDependencyFile('node_modules\\package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir\\node_modules\\package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir\\node_modules\\test-package\\package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir\\test-package\\package.json')).to.equal(true);
  });
  
  it('handles multiple excluded folders', () => {
    const manager = new Manager('excludedFolders2', config.excludedFolders2);
    
    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('package2.json')).to.equal(true);
    expect(manager.isDependencyFile('subdir/package.json')).to.equal(true);
    expect(manager.isDependencyFile('subdir/package2.json')).to.equal(true);
    expect(manager.isDependencyFile('node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/package.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/vendor/package.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/vendor/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/vendor/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/vendor/package2.json')).to.equal(false);
  });

  it('handles dependency files in the root directory', () => {
    const manager = new Manager('rootDir1', config.rootDir1);
    
    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/test-package/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/package.json')).to.equal(false);
  });
  
  it('handles multiple dependency files in the root directory', () => {
    const manager = new Manager('rootDir2', config.rootDir2);
    
    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('package2.json')).to.equal(true);
    expect(manager.isDependencyFile('node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/test-package/package.json')).to.equal(false);
    expect(manager.isDependencyFile('node_modules/test-package/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/package2.json')).to.equal(true);
    expect(manager.isDependencyFile('subdir/node_modules/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/node_modules/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/package.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/test-package/package.json')).to.equal(false);
    expect(manager.isDependencyFile('vendor/test-package/package2.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/vendor/package.json')).to.equal(false);
    expect(manager.isDependencyFile('subdir/vendor/package2.json')).to.equal(false);
  });
  
    it('handles multiple contexts with install', () => {
      const manager = new Manager('multipleContextsInstall', config.multipleContextsInstall);
      manager.update(['backend', 'frontend']);
  
      expect(infoSpy).to.have.been.called();
      expect(infoSpy).to.have.been.called.twice;
      expect(infoSpy).to.have.been.called.with('multipleContextsInstall packages have changed (in frontend/), installing the updated packages..');
      expect(infoSpy).to.have.been.called.with('multipleContextsInstall packages have changed (in backend/), installing the updated packages..');
      expect(warnSpy).to.not.have.been.called();
      expect(errorSpy).to.not.have.been.called();
      expect(execSpy).to.have.been.called();
      expect(execSpy).to.have.been.called.twice;
      expect(execSpy).to.have.been.called.with('npm install');
    });

  it('handles multiple contexts with warn', () => {
    const manager = new Manager('multipleContextsWarn', config.multipleContextsWarn);
    manager.update(['backend', 'frontend']);

    expect(warnSpy).to.have.been.called();
    expect(warnSpy).to.have.been.called.exactly(4);
    expect(warnSpy).to.have.been.called.with('multipleContextsWarn packages have changed (in frontend/) but are not updated automatically');
    expect(warnSpy).to.have.been.called.with('multipleContextsWarn packages have changed (in backend/) but are not updated automatically');
    expect(warnSpy).to.have.been.called.with(`you may need to run 'npm install' manually if your app requires the new versions of the packages`);
    expect(infoSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });
  
  it('executes a command in a subdirectory', () => {
    const gitHooksPath = path.resolve(__dirname, '..', 'dist');

    const manager1 = new Manager('valid', config.valid);
    manager1.executeCommand('frontend');

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with.exactly('npm prune && npm install', {cwd: gitHooksPath + '/frontend', stdio: 'inherit'});

    execSpy = spy();

    const manager2 = new Manager('install', config.install);
    manager2.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once;
    expect(execSpy).to.have.been.called.with('npm install');
  });
});
