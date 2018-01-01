import path from 'path';
import { expect } from 'chai';
import mock from 'mock-fs';
import { getGitHooksPath, resetGitHooksPath } from '../dist/paths';

describe('paths', () => {
  beforeEach(() => {
    resetGitHooksPath();
  });

  after(() => {
    mock.restore();
  });

  it('detects the git hooks path', () => {
    const rootDir = path.resolve(__dirname, '..');

    mock({
      [rootDir + '/.git/hooks']: '',
    });

    expect(getGitHooksPath()).to.equal(rootDir + '/.git/hooks');

    resetGitHooksPath();

    mock({
      [path.resolve(rootDir, '..', '.git/hooks')]: '',
    });

    expect(getGitHooksPath()).to.equal(path.resolve(rootDir, '..', '.git/hooks'));
  });

  it('detects non existing git hooks path', () => {
    const rootDir = path.resolve(__dirname, '..');

    mock({
      [rootDir + '/some-other-dir/.git/hooks']: '',
    });

    expect(getGitHooksPath()).to.equal(null);

    resetGitHooksPath();

    mock({});

    expect(getGitHooksPath()).to.equal(null);
  });
  
  it('caches the git hooks path', () => {
    const rootDir = path.resolve(__dirname, '..');

    mock({
      [rootDir + '/.git/hooks']: '',
    });

    expect(getGitHooksPath()).to.equal(rootDir + '/.git/hooks');

    mock({});

    expect(getGitHooksPath()).to.equal(rootDir + '/.git/hooks');
  });
});
