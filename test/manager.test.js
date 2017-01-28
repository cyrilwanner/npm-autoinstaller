import chai, { expect, spy } from 'chai';
import spies from 'chai-spies';
import proxyquire from 'proxyquire';

chai.use(spies);

let infoSpy;
let warnSpy;
let errorSpy;
let execSpy;
let askSpy;

const packages = {
  './config': {
    config: {
      valid: {
        do: 'ask',
        fallback: 'warn',
        command: 'npm prune && npm install',
        files: ['package.json']
      },
      install: {
        do: 'install',
        command: 'npm install',
        files: ['package.json']
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
        files: ['packages.json']
      },
      filesArray: {
        command: 'npm install',
        files: 'package.json'
      },
      defaultAction: {
        command: 'npm install',
        files: ['package.json']
      },
      ttyDefaultAction: {
        do: 'ask',
        command: 'npm install',
        files: ['package.json']
      },
      disabled1: {
        do: false,
        command: 'npm install',
        files: ['package.json']
      },
      disabled2: {
        do: 'disabled',
        command: 'npm install',
        files: ['package.json']
      },
      disabled3: {
        do: null,
        command: 'npm install',
        files: ['package.json']
      },
      dependencyFile: {
        command: 'npm install',
        files: ['package.json', 'test/package2.json']
      },
      invalid1: {
        command: 'npm install'
      },
      invalid2: {
        files: ['package.json']
      },
      invalid3: {
        do: 'ask'
      }
    }
  },
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
    const manager = new Manager('valid');

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.name).to.equal('valid');
    expect(manager.command).to.equal('npm prune && npm install');
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('does not accept invalid configs', () => {
    expect(() => new Manager('invalid1')).to.throw('can not load manager from config');
    expect(() => new Manager('invalid2')).to.throw('can not load manager from config');
    expect(() => new Manager('invalid3')).to.throw('can not load manager from config');
    expect(() => new Manager('invalid4')).to.throw('can not load manager from config');
  });

  it('converts files to an array', () => {
    const manager = new Manager('filesArray');

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('falls back to a default action', () => {
    const manager = new Manager('defaultAction');

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.action).to.equal('install');
    expect(manager.command).to.equal('npm install');
    expect(manager.files).to.deep.equal(['package.json']);
  });

  it('uses the fallback action if the terminal does not support TTY', () => {
    process.stdout.isTTY = true;
    const manager1 = new Manager('valid');

    expect(manager1).to.be.an.instanceof(Manager);
    expect(manager1.action).to.equal('ask');

    process.stdout.isTTY = false;
    const manager2 = new Manager('valid');

    expect(manager2).to.be.an.instanceof(Manager);
    expect(manager2.action).to.equal('warn');

    const manager3 = new Manager('ttyDefaultAction');

    expect(manager3).to.be.an.instanceof(Manager);
    expect(manager3.action).to.equal('install');
  });

  it('checks if the manager is disabled', () => {
    const manager1 = new Manager('disabled1');

    expect(manager1).to.be.an.instanceof(Manager);
    expect(manager1.isDisabled()).to.equal(true);

    const manager2 = new Manager('disabled2');

    expect(manager2).to.be.an.instanceof(Manager);
    expect(manager2.isDisabled()).to.equal(true);

    const manager3 = new Manager('disabled3');

    expect(manager3).to.be.an.instanceof(Manager);
    expect(manager3.isDisabled()).to.equal(true);

    const manager4 = new Manager('valid');

    expect(manager4).to.be.an.instanceof(Manager);
    expect(manager4.isDisabled()).to.equal(false);

    const manager5 = new Manager('install');

    expect(manager5).to.be.an.instanceof(Manager);
    expect(manager5.isDisabled()).to.equal(false);

    const manager6 = new Manager('warn');

    expect(manager6).to.be.an.instanceof(Manager);
    expect(manager6.isDisabled()).to.equal(false);
  });

  it('checks if a file is handled by this manager', () => {
    const manager = new Manager('dependencyFile');

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.isDependencyFile('package.json')).to.equal(true);
    expect(manager.isDependencyFile('package.js')).to.equal(false);
    expect(manager.isDependencyFile('test')).to.equal(false);
    expect(manager.isDependencyFile('test/package.json')).to.equal(false);
    expect(manager.isDependencyFile('package2.json')).to.equal(false);
    expect(manager.isDependencyFile('test/package2.json')).to.equal(true);
  });

  it('handles the install action correctly', () => {
    const manager = new Manager('install');
    manager.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.once();
    expect(infoSpy).to.have.been.called.with('install packages have changed, installing the updated packages..');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm install');
  });

  it('handles the warn action correctly', () => {
    const manager = new Manager('warn');
    manager.update();

    expect(warnSpy).to.have.been.called();
    expect(warnSpy).to.have.been.called.twice();
    expect(warnSpy).to.have.been.called.with('warn packages have changed but are not updated automatically');
    expect(warnSpy).to.have.been.called.with(`you may need to run 'npm install' manually if your app requires the new versions of the packages`);
    expect(infoSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('handles the ask action correctly', () => {
    askSpy = (...args) => true;

    const manager1 = new Manager('ask');
    manager1.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.twice();
    expect(infoSpy).to.have.been.called.with('ask packages have changed, do you want to install the new versions?');
    expect(infoSpy).to.have.been.called.with('installing updated packages..');
    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm install');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();

    infoSpy = spy();
    execSpy = spy();
    askSpy = (...args) => false;

    const manager2 = new Manager('ask');
    manager2.update();

    expect(infoSpy).to.have.been.called();
    expect(infoSpy).to.have.been.called.twice();
    expect(infoSpy).to.have.been.called.with('ask packages have changed, do you want to install the new versions?');
    expect(infoSpy).to.have.been.called.with('updated packages won\'t get installed');
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('handles a disabled action correctly', () => {
    const manager = new Manager('disabled1');
    manager.update();

    expect(infoSpy).to.not.have.been.called();
    expect(warnSpy).to.not.have.been.called();
    expect(errorSpy).to.not.have.been.called();
    expect(execSpy).to.not.have.been.called();
  });

  it('executes the correct command', () => {
    const manager1 = new Manager('valid');
    manager1.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm prune && npm install');

    execSpy = spy();

    const manager2 = new Manager('install');
    manager2.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm install');
  });

  it('handles invalid commands', () => {
    execSpy = spy((...args) => {
      throw new Error('custom-error');
    });

    const manager1 = new Manager('valid');
    manager1.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm prune && npm install');
    expect(errorSpy).to.have.been.called();
    expect(errorSpy).to.have.been.called.twice();
    expect(errorSpy).to.have.been.called.with('packages could not be installed');

    execSpy = spy((...args) => {
      throw new Error('asdf command not found');
    });
    errorSpy = spy();

    const manager2 = new Manager('valid');
    manager2.executeCommand();

    expect(execSpy).to.have.been.called();
    expect(execSpy).to.have.been.called.once();
    expect(execSpy).to.have.been.called.with('npm prune && npm install');
    expect(errorSpy).to.have.been.called();
    expect(errorSpy).to.have.been.called.twice();
    expect(errorSpy).to.have.been.called.with(`the command 'npm' could not be found`);
    expect(errorSpy).to.have.been.called.with('please install it globally or update the install command in the npm-autoinstaller config');
  });
});
