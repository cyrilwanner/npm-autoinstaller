import chai, { expect, spy } from 'chai';
import spies from 'chai-spies-next';
import proxyquire from 'proxyquire';
import { Manager } from '../dist/manager';

chai.use(spies);

let updateSpy;
let separatorSpy;

const packages = {
  './managers': {
    getManager: (manager) => {
      return {
        update: () => updateSpy(manager)
      };
    },
    allManagers: [
      new Manager('npm', {
        command: 'npm install',
        files: ['package.json']
      }),
      new Manager('test1', {
        command: 'npm test',
        files: ['sub/file.txt', 'file2.txt']
      }),
      new Manager('test2', {
        command: 'npm test',
        files: ['test/1', 'test/2.jpg', 'test/3.gif']
      })
    ]
  },
  './log': {
    separator: (...args) => separatorSpy(...args),
  }
};

const { changedFilesToArray, checkForUpdates } = proxyquire('../dist/updatePackages.js', packages);

describe('updatePackages', () => {
  beforeEach(() => {
    updateSpy = spy();
    separatorSpy = spy();
  });

  it('converts a file into an array', () => {
    const file = `line1
line2
/test/package.json

. !`;
    const content = changedFilesToArray(file);

    expect(content).to.be.an('array');
    expect(content.length).to.equal(5);
    expect(content[0]).to.equal('line1');
    expect(content[1]).to.equal('line2');
    expect(content[2]).to.equal('/test/package.json');
    expect(content[3]).to.equal('');
    expect(content[4]).to.equal('. !');
  });

  it('only converts strings to an array', () => {
    expect(changedFilesToArray()).to.be.an('undefined');
    expect(changedFilesToArray(true)).to.equal(true);
    expect(changedFilesToArray(['package.json', 'test2'])).to.deep.equal(['package.json', 'test2']);
    expect(changedFilesToArray({a: '1', b: '2'})).to.deep.equal({a: '1', b: '2'});
  });

  it('detects a single manager updated', () => {
    checkForUpdates(['package.json']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.once;
    expect(updateSpy).to.have.been.called.with('npm');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.twice;

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['sub/file.txt']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.once;
    expect(updateSpy).to.have.been.called.with('test1');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.twice;

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['afile.txt', 'test/2.jpg']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.once;
    expect(updateSpy).to.have.been.called.with('test2');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.twice;
  });

  it('detects multiple manager updates', () => {
    checkForUpdates(['package.json', 'sub/file.txt']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.twice;
    expect(updateSpy).to.have.been.called.with('npm');
    expect(updateSpy).to.have.been.called.with('test1');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.exactly(3);

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['test/1', 'sub/file.txt', 'another.file']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.twice;
    expect(updateSpy).to.have.been.called.with('test1');
    expect(updateSpy).to.have.been.called.with('test2');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.exactly(3);

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['test/1', 'sub/file.txt', 'another.file', 'package.json']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.exactly(3);
    expect(updateSpy).to.have.been.called.with('test1');
    expect(updateSpy).to.have.been.called.with('test2');
    expect(updateSpy).to.have.been.called.with('npm');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.exactly(4);
  });

  it('only executes each manager once', () => {
    checkForUpdates(['package.json', 'a', 'package.json']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.once;
    expect(updateSpy).to.have.been.called.with('npm');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.twice;

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['package.json', 'a', 'package.json', 'file2.txt', 'sub/file.txt']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.twice;
    expect(updateSpy).to.have.been.called.with('npm');
    expect(updateSpy).to.have.been.called.with('test1');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.exactly(3);

    updateSpy = spy();
    separatorSpy = spy();

    checkForUpdates(['package.json', 'a', 'package.json', 'file2.txt', 'sub/file.txt', 'test/1', 'test/2.jpg', 'test/3.gif', 'asdf.txt', 'test/4']);

    expect(updateSpy).to.have.been.called();
    expect(updateSpy).to.have.been.called.exactly(3);
    expect(updateSpy).to.have.been.called.with('npm');
    expect(updateSpy).to.have.been.called.with('test1');
    expect(updateSpy).to.have.been.called.with('test2');
    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.exactly(4);
  });

  it('does not update any manager if no such file got changed', () => {
    checkForUpdates(['packagedjson', 'package/json', 'sub/spackage.json', 'test/2', 'test/2.gif', 'file2.txtt']);

    expect(updateSpy).to.not.have.been.called();
    expect(separatorSpy).to.not.have.been.called();
  });
});
