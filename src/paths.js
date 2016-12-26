import path from 'path';

export const packagePath = path.resolve(__dirname + '/..');
export const rootPath = path.resolve(__dirname).split('/node_modules')[0];
export const gitHooksPath = `${rootPath}/.git/hooks`;
