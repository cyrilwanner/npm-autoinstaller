import chai, { expect, spy } from 'chai';
import spies from 'chai-spies-next';
import mock from 'mock-fs';
import fs from 'fs';
import proxyquire from 'proxyquire';
import { resetGitHooksPath } from '../../dist/paths';

chai.use(spies);

let errorSpy;
let separatorSpy;

const packages = {
  '../log': {
    error: (...args) => errorSpy(...args),
    separator: (...args) => separatorSpy(...args)
  }
};

const infoString = 'this file has been automatically generated, please do not edit it';

const {
  isAutoinstallerHook,
  hasAlreadyOtherHooks,
  replaceHookInString,
  copyHooks,
  installHooks
} = proxyquire('../../dist/hooks/install', packages);

describe('hooks:install', () => {
  before(() => {
    resetGitHooksPath();
  });

  after(() => {
    resetGitHooksPath();
  });

  beforeEach(() => {
    errorSpy = spy();
    separatorSpy = spy();
  });

  it('correctly detects previous npm-autoinstaller hooks', () => {
    mock({
      'dist/.git/hooks': {
        'post-checkout': '#!/bin/bash\n# --\n# npm-autoinstaller',
        'post-merge': '#!/bin/sh\n\n# npm-autoinstallerrrr',
        'post-rewrite': '#!/bin/bash\n\n# npm-autoinstaller test !\n# end of file'
      }
    });

    expect(isAutoinstallerHook('post-checkout')).to.equal(true);
    expect(isAutoinstallerHook('post-merge')).to.equal(true);
    expect(isAutoinstallerHook('post-rewrite')).to.equal(true);
  });

  it('correctly detects other hooks', () => {
    mock({
      'dist/.git/hooks': {
        'post-checkout': '#!/bin/bash\n# other\n# hook',
        'post-merge': '#!/bin/node\n\nvar other = "hook";\nprocess.exit()',
        'post-rewrite': '#!/bin/bash'
      }
    });

    expect(isAutoinstallerHook('post-checkout')).to.equal(false);
    expect(isAutoinstallerHook('post-merge')).to.equal(false);
    expect(isAutoinstallerHook('post-rewrite')).to.equal(false);
  });

  it('deletes hooks of older npm-autoinstaller versions', () => {
    mock({
      'dist/.git/hooks': {
        'post-checkout': '#!/bin/bash\n# --\n# npm-autoinstaller',
        'post-merge': '#!/bin/bash\n# --\n# npm-autoinstaller',
        'post-rewrite': '#!/bin/bash\n# --\n# npm-autoinstaller'
      }
    });

    expect(hasAlreadyOtherHooks()).to.equal(false);
    expect(fs.existsSync('dist/.git/hooks/post-checkout')).to.equal(false);
    expect(fs.existsSync('dist/.git/hooks/post-merge')).to.equal(false);
    expect(fs.existsSync('dist/.git/hooks/post-rewrite')).to.equal(false);
  });

  it('keeps other hooks', () => {
    mock({
      'dist/.git/hooks': {
        'post-checkout': '#!/bin/bash\n# --\n# npm-autoinstaller',
        'post-merge': '#!/bin/bash\n# --\n# no-npm-autoinstaller',
        'post-rewrite': '#!/bin/bash\n# --\n# no-npm-autoinstaller'
      }
    });

    expect(hasAlreadyOtherHooks()).to.equal(true);
    expect(fs.existsSync('dist/.git/hooks/post-checkout')).to.equal(false);
    expect(fs.existsSync('dist/.git/hooks/post-merge')).to.equal(true);
    expect(fs.existsSync('dist/.git/hooks/post-rewrite')).to.equal(true);
  });

  it('replaces hook placeholders in the template', () => {
    expect(replaceHookInString('{HOOK}', 'post-checkout', '../project-path')).to.equal('post-checkout');
    expect(replaceHookInString('#!/bin/bash\n node {HOOK}\nexit 0', 'post-merge', '../project-path')).to.equal('#!/bin/bash\n node post-merge\nexit 0');
    expect(replaceHookInString('{HOOK}:{HOOK}', 'post-checkout', '../project-path')).to.equal('post-checkout:post-checkout');
  });

  it('replaces info placeholders in the template', () => {
    expect(replaceHookInString('{INFO}', 'post-checkout', '../project-path')).to.equal(infoString);
    expect(replaceHookInString('#!/bin/bash\n# {INFO}\nexit 0', 'post-merge', '../project-path')).to.equal(`#!/bin/bash\n# ${infoString}\nexit 0`);
    expect(replaceHookInString('{INFO}:{INFO}', 'post-checkout', '../project-path')).to.equal(`${infoString}:${infoString}`);
  });

  it('replaces path placeholders in the template', () => {
    expect(replaceHookInString('{PATH}', 'post-checkout', '../project-path')).to.equal('../project-path');
    expect(replaceHookInString('#!/bin/bash\n# {PATH}\nexit 0', 'post-merge', '../project-path')).to.equal(`#!/bin/bash\n# ../project-path\nexit 0`);
    expect(replaceHookInString('{PATH}:{PATH}', 'post-checkout', '../project-path')).to.equal(`../project-path:../project-path`);
  });

  it('copies the hook template for all hooks', () => {
    mock({
      'dist/hooks': {
        'hook-template.sh': '#!/bin/bash\n# {INFO}\n# npm-autoinstaller\nnode {HOOK}\n'
      },
      'dist/.git/hooks': {}
    });

    copyHooks();

    expect(fs.existsSync('dist/.git/hooks/post-checkout')).to.equal(true);
    expect(fs.existsSync('dist/.git/hooks/post-merge')).to.equal(true);
    expect(fs.existsSync('dist/.git/hooks/post-rewrite')).to.equal(true);

    const postCheckout = fs.readFileSync('dist/.git/hooks/post-checkout', 'utf8');
    const postMerge = fs.readFileSync('dist/.git/hooks/post-merge', 'utf8');
    const postRewrite = fs.readFileSync('dist/.git/hooks/post-rewrite', 'utf8');

    expect(postCheckout).to.equal(`#!/bin/bash\n# ${infoString}\n# npm-autoinstaller\nnode post-checkout\n`);
    expect(postMerge).to.equal(`#!/bin/bash\n# ${infoString}\n# npm-autoinstaller\nnode post-merge\n`);
    expect(postRewrite).to.equal(`#!/bin/bash\n# ${infoString}\n# npm-autoinstaller\nnode post-rewrite\n`);

    const postCheckoutStat = fs.statSync('dist/.git/hooks/post-checkout');
    const postMergeStat = fs.statSync('dist/.git/hooks/post-merge');
    const postRewriteStat = fs.statSync('dist/.git/hooks/post-rewrite');

    expect(parseInt(postCheckoutStat.mode.toString(8), 10)).to.equal(100755);
    expect(parseInt(postMergeStat.mode.toString(8), 10)).to.equal(100755);
    expect(parseInt(postRewriteStat.mode.toString(8), 10)).to.equal(100755);
  });

  it('shows an error when hooks can\'t be copied', () => {
    mock({});

    copyHooks();

    expect(separatorSpy).to.have.been.called();
    expect(separatorSpy).to.have.been.called.twice;
    expect(errorSpy).to.have.been.called();
    expect(errorSpy).to.have.been.called.exactly(3);
    expect(errorSpy).to.have.been.called.with('npm-autoinstaller could not be installed:');
    expect(errorSpy).to.have.been.called.with('could not copy git hooks!');
  });

  it('checks when the project has no .git folder', (done) => {
    mock({});

    installHooks(() => {
      expect(separatorSpy).to.have.been.called();
      expect(separatorSpy).to.have.been.called.twice;
      expect(errorSpy).to.have.been.called();
      expect(errorSpy).to.have.been.called.exactly(3);
      expect(errorSpy).to.have.been.called.with('npm-autoinstaller could not be installed:');
      expect(errorSpy).to.have.been.called.with('git hooks directory not found!');
      expect(errorSpy).to.have.been.called.with('this directory is most likely not a git repository.');

      done();
    });
  });

  it('checks when the project has other hooks installed', (done) => {
    mock({
      'dist/.git/hooks': {
        'post-checkout': '# !/bin/bash\n# other\n# hook'
      }
    });

    installHooks(() => {
      expect(separatorSpy).to.have.been.called();
      expect(separatorSpy).to.have.been.called.twice;
      expect(errorSpy).to.have.been.called();
      expect(errorSpy).to.have.been.called.exactly(4);
      expect(errorSpy).to.have.been.called.with('npm-autoinstaller could not be installed:');
      expect(errorSpy).to.have.been.called.with('it seems like you already have some git hooks installed.');
      expect(errorSpy).to.have.been.called.with('if you are using (or have used) another git-hooks package, please read:');

      done();
    });
  });
});
