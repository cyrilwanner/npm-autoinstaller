import path from 'path';
import fs from 'fs';

export const packagePath = path.resolve(`${__dirname}${path.sep}..`);
export const rootPath = path.resolve(__dirname).split(`${path.sep}node_modules`)[0];

let cachedGitHooksPath;

/**
 * find the path where githooks are stored for the current git repository
 *
 * @return  {string}
 */
export const getGitHooksPath = () => {
  if (cachedGitHooksPath) {
    return cachedGitHooksPath;
  }

  let prevPath = rootPath;
  let maxIterations = 10;

  do {
    if (fs.existsSync(`${prevPath}${path.sep}.git${path.sep}hooks`)) {
      cachedGitHooksPath = `${prevPath}${path.sep}.git${path.sep}hooks`;
      return cachedGitHooksPath;
    }

    let nextPath = path.resolve(prevPath, '..');

    // abort when reached the top most folder or only gets installed as a dependency of another module
    if (nextPath === prevPath || path.basename(nextPath) === 'node_modules') {
      return null;
    }

    prevPath = nextPath;
    maxIterations--;
  } while (maxIterations >= 0);
};

/**
 * reset the cached git hooks path
 */
export const resetGitHooksPath = () => {
  cachedGitHooksPath = null;
};
