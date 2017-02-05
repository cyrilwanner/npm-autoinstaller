import { expect } from 'chai';
import mock from 'mock-fs';
import { loadFile, loadUserConfig } from '../dist/config';

const defaultConfig = {
  npm: {
    do: 'install',
    fallback: 'install',
    command: 'npm prune && npm install',
    files: ['package.json']
  },
  bower: {
    do: 'install',
    fallback: 'install',
    command: 'bower install',
    files: ['bower.json']
  },
  userConfig: 'autoinstaller.json'
};

describe('config', () => {
  beforeEach(() => {
    mock({
      dist: {
        'file.json': '{\n"foo": "bar"\n}',
        'file.txt': 'text\nfile'
      }
    });
  });

  afterEach(() => {
    mock.restore();
  });

  it('loads and parses a json file', () => {
    const content = loadFile('file.json');
    expect(content).to.be.an('object');
    expect(content.foo).to.exist;
    expect(content.foo).to.equal('bar');
    expect(content).to.deep.equal({foo: 'bar'});
  });

  it('correctly exits if it is not a json file', () => {
    const content = loadFile('file.txt');
    expect(content).to.be.null;
  });

  it('correctly exits if the file does not exist', () => {
    const content = loadFile('foo.bar');
    expect(content).to.be.null;
  });

  it('loads an empty package.json', () => {
    mock({
      dist: {
        'package1.json': '{}',
        'package2.json': '{"autoinstaller": {}}',
        'package3.json': '{"autoinstaller": false}'
      }
    });

    const package1 = loadUserConfig({}, 'package1.json', 'autoinstaller', false);
    const package2 = loadUserConfig({}, 'package2.json', 'autoinstaller', false);
    const package3 = loadUserConfig({}, 'package3.json', 'autoinstaller', false);

    expect(package1).to.be.an('object');
    expect(package1).to.deep.equal({});
    expect(package2).to.be.an('object');
    expect(package2).to.deep.equal({});
    expect(package3).to.be.an('object');
    expect(package3).to.deep.equal({});
  });

  it('returns the default config', () => {
    mock({
      dist: {
        'package1.json': '{}',
        'package2.json': '{"autoinstaller": {}}',
        'package3.json': '{"autoinstaller": false}'
      }
    });

    const package1 = loadUserConfig(defaultConfig, 'package1.json', 'autoinstaller', false);
    const package2 = loadUserConfig(defaultConfig, 'package2.json', 'autoinstaller', false);
    const package3 = loadUserConfig(defaultConfig, 'package3.json', 'autoinstaller', false);

    expect(package1).to.be.an('object');
    expect(package1).to.deep.equal(defaultConfig);
    expect(package2).to.be.an('object');
    expect(package2).to.deep.equal(defaultConfig);
    expect(package3).to.be.an('object');
    expect(package3).to.deep.equal(defaultConfig);
  });

  it('overrides the default config', () => {
    mock({
      dist: {
        'package1.json': '{"npm": {"do": "ask", "fallback": "warn", "command": "test"}}',
        'package2.json': '{"autoinstaller": {"npm": {"do": "warn", "fallback": "warn", "command": "test2"}}}',
        'package3.json': '{"npm": {"do": "warn"}, "bower": {"fallback": "warn"}}'
      }
    });

    const package1 = loadUserConfig(defaultConfig, 'package1.json', null, false);
    const package2 = loadUserConfig(defaultConfig, 'package2.json', 'autoinstaller', false);
    const package3 = loadUserConfig(defaultConfig, 'package3.json', null, false);

    expect(package1).to.be.an('object');
    expect(package1).to.not.deep.equal(defaultConfig);
    expect(package1.npm.do).to.equal('ask');
    expect(package1.npm.fallback).to.equal('warn');
    expect(package1.npm.command).to.equal('test');
    expect(package1.npm.files).to.deep.equal(['package.json']);
    expect(package1.bower.do).to.equal('install');
    expect(package1.bower.fallback).to.equal('install');
    expect(package1.bower.command).to.equal('bower install');
    expect(package1.bower.files).to.deep.equal(['bower.json']);
    expect(package2).to.be.an('object');
    expect(package2).to.not.deep.equal(defaultConfig);
    expect(package2.npm.do).to.equal('warn');
    expect(package2.npm.fallback).to.equal('warn');
    expect(package2.npm.command).to.equal('test2');
    expect(package2.npm.files).to.deep.equal(['package.json']);
    expect(package2.bower.do).to.equal('install');
    expect(package2.bower.fallback).to.equal('install');
    expect(package2.bower.command).to.equal('bower install');
    expect(package2.bower.files).to.deep.equal(['bower.json']);
    expect(package3).to.be.an('object');
    expect(package3).to.not.deep.equal(defaultConfig);
    expect(package3.npm.do).to.equal('warn');
    expect(package3.npm.fallback).to.equal('install');
    expect(package3.npm.command).to.equal('npm prune && npm install');
    expect(package3.npm.files).to.deep.equal(['package.json']);
    expect(package3.bower.do).to.equal('install');
    expect(package3.bower.fallback).to.equal('warn');
    expect(package3.bower.command).to.equal('bower install');
    expect(package3.bower.files).to.deep.equal(['bower.json']);
  });

  it('overrides the files array', () => {
    mock({
      dist: {
        'package.json': '{"npm": {"files": ["file1.txt", "dir/file2.txt"]}}'
      }
    });


    const content = loadUserConfig(defaultConfig, 'package.json', null, false);

    expect(content).to.be.an('object');
    expect(content.npm.files).to.be.an('array');
    expect(content.npm.files.length).to.equal(2);
    expect(content.npm.files[0]).to.equal('file1.txt');
    expect(content.npm.files[1]).to.equal('dir/file2.txt');
    expect(content.bower.files).to.be.an('array');
    expect(content.bower.files.length).to.equal(1);
    expect(content.bower.files[0]).to.equal('bower.json');
  });

  it('loads the default user config', () => {
    mock({
      dist: {
        'package1.json': '{}',
        'package2.json': '{"npm": {"do": "ask", "fallback": "warn"}}',
        'autoinstaller.json': '{"npm": {"do": "warn"}}'
      }
    });

    const package1 = loadUserConfig(defaultConfig, 'package1.json');
    const package2 = loadUserConfig(defaultConfig, 'package2.json');

    expect(package1).to.be.an('object');
    expect(package1.npm.do).to.equal('warn');
    expect(package1.npm.fallback).to.equal('install');
    expect(package1.npm.command).to.equal('npm prune && npm install');
    expect(package1.npm.files).to.deep.equal(['package.json']);
    expect(package1.userConfig).to.equal('autoinstaller.json');
    expect(package2).to.be.an('object');
    expect(package2.npm.do).to.equal('warn');
    expect(package2.npm.fallback).to.equal('warn');
    expect(package2.npm.command).to.equal('npm prune && npm install');
    expect(package2.npm.files).to.deep.equal(['package.json']);
    expect(package2.userConfig).to.equal('autoinstaller.json');
  });

  it('loads a custom user config', () => {
    mock({
      dist: {
        'package.json': '{"npm": {"do": "ask", "fallback": "warn"}, "userConfig": "configs/npm-autoinstaller.json"}',
        configs: {
          'npm-autoinstaller.json': '{"npm": {"do": "warn"}}'
        }
      }
    });

    const content = loadUserConfig(defaultConfig, 'package.json');

    expect(content).to.be.an('object');
    expect(content.npm.do).to.equal('warn');
    expect(content.npm.fallback).to.equal('warn');
    expect(content.npm.command).to.equal('npm prune && npm install');
    expect(content.npm.files).to.deep.equal(['package.json']);
    expect(content.userConfig).to.equal('configs/npm-autoinstaller.json');
  });

  it('loads the user config recursively', () => {
    mock({
      dist: {
        'package.json': '{"autoinstaller": {"npm": {"do": "ask1", "fallback": "warn1", "command": "cmd1"}}}',
        'autoinstaller.json': '{"npm": {"do": "ask2", "fallback": "warn2"}, "userConfig": "autoinstaller.local.json"}',
        'autoinstaller.local.json': '{"npm": {"do": "ask3"}}'
      }
    });

    const content = loadUserConfig(defaultConfig, 'package.json', 'autoinstaller');

    expect(content).to.be.an('object');
    expect(content.npm.do).to.equal('ask3');
    expect(content.npm.fallback).to.equal('warn2');
    expect(content.npm.command).to.equal('cmd1');
    expect(content.npm.files).to.deep.equal(['package.json']);
    expect(content.userConfig).to.equal('autoinstaller.local.json');
  });
});
