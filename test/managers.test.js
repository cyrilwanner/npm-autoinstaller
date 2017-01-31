import { expect } from 'chai';
import proxyquire from 'proxyquire';
import { Manager } from '../dist/manager';

const packages = {
  './config': {
    config: {
      npm: {
        do: 'warn',
        command: 'npm install',
        files: ['package.json']
      },
      valid: {
        command: 'npm test',
        files: ['test.json']
      },
      'sp3cial-naMe%&': {
        command: 'npm build',
        files: ['.gitignore']
      },
      invalid: {
        do: 'install'
      }
    }
  }
};

const { getAllManagers, getManager } = proxyquire('../dist/managers', packages);

describe('managers', () => {
  it('loads valid managers', () => {
    const managers = getAllManagers({
      npm: {
        do: 'warn',
        command: 'npm install',
        files: ['package.json']
      },
      valid: {
        command: 'npm test',
        files: ['test.json', 'test2.json']
      }
    });

    expect(managers).to.be.an('array');
    expect(managers.length).to.equal(2);

    expect(managers[0]).to.be.an.instanceof(Manager);
    expect(managers[0].name).to.equal('npm');
    expect(managers[0].action).to.equal('warn');
    expect(managers[0].command).to.equal('npm install');
    expect(managers[0].files).to.deep.equal(['package.json']);

    expect(managers[1]).to.be.an.instanceof(Manager);
    expect(managers[1].name).to.equal('valid');
    expect(managers[1].action).to.equal('install');
    expect(managers[1].command).to.equal('npm test');
    expect(managers[1].files).to.deep.equal(['test.json', 'test2.json']);
  });

  it('skips invalid managers', () => {
    const managers = getAllManagers({
      npm: {
        do: 'warn',
        command: 'npm install',
        files: ['package.json']
      },
      invalid: {
        do: 'install'
      },
      valid: {
        command: 'npm test',
        files: ['test.json', 'test2.json']
      }
    });

    expect(managers).to.be.an('array');
    expect(managers.length).to.equal(2);

    expect(managers[0]).to.be.an.instanceof(Manager);
    expect(managers[0].name).to.equal('npm');
    expect(managers[0].action).to.equal('warn');
    expect(managers[0].command).to.equal('npm install');
    expect(managers[0].files).to.deep.equal(['package.json']);

    expect(managers[1]).to.be.an.instanceof(Manager);
    expect(managers[1].name).to.equal('valid');
    expect(managers[1].action).to.equal('install');
    expect(managers[1].command).to.equal('npm test');
    expect(managers[1].files).to.deep.equal(['test.json', 'test2.json']);
  });

  it('returns a manager by its name', () => {
    const manager1 = getManager('npm');

    expect(manager1).to.be.an.instanceof(Manager);
    expect(manager1.name).to.equal('npm');
    expect(manager1.action).to.equal('warn');
    expect(manager1.command).to.equal('npm install');
    expect(manager1.files).to.deep.equal(['package.json']);

    const manager2 = getManager('valid');

    expect(manager2).to.be.an.instanceof(Manager);
    expect(manager2.name).to.equal('valid');
    expect(manager2.action).to.equal('install');
    expect(manager2.command).to.equal('npm test');
    expect(manager2.files).to.deep.equal(['test.json']);
  });

  it('returns a manager with special characters in its name', () => {
    const manager = getManager('sp3cial-naMe%&');

    expect(manager).to.be.an.instanceof(Manager);
    expect(manager.name).to.equal('sp3cial-naMe%&');
    expect(manager.action).to.equal('install');
    expect(manager.command).to.equal('npm build');
    expect(manager.files).to.deep.equal(['.gitignore']);
  });

  it('handles manager names case sensitive', () => {
    expect(getManager('NpM')).to.be.an('undefined');
    expect(getManager('Npm')).to.be.an('undefined');
    expect(getManager('npm')).to.be.an.instanceof(Manager);

    expect(getManager('VALid')).to.be.an('undefined');

    expect(getManager('sp3cial-name%&')).to.be.an('undefined');
    expect(getManager('sp3cial-naMe%&')).to.be.an.instanceof(Manager);
  });
});
