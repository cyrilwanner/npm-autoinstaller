import path from 'path';

export const packagePath = path.resolve(`${__dirname}${path.sep}..`);
export const rootPath = path.resolve(__dirname).split(`${path.sep}node_modules`)[0];
export const gitHooksPath = `${rootPath}${path.sep}.git${path.sep}hooks`;
