import path from 'path';
import fs from 'fs';

export const packagePath = path.resolve(`${__dirname}${path.sep}..`);
export const rootPath = path.resolve(__dirname).split(`${path.sep}node_modules`)[0];

/**
 * find the path where githooks are stored for the current git repository
 *
 * @return  {string}
 */
export const findGitHooksPath = () => {
  let prevPath = rootPath;
  let maxIterations = 10;

  do {
    if (fs.existsSync(`${prevPath}${path.sep}.git${path.sep}hooks`)) {
      return `${prevPath}${path.sep}.git${path.sep}hooks`;
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
