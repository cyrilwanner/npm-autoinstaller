import 'colors';

export const prefix = 'npm-autoinstaller:';

export const info = (str) => console.log(`${prefix.gray} ${str}`);
export const warn = (str) => console.warn(`${prefix.yellow} ${str}`);
export const error = (str) => console.error(`${prefix.red} ${str}`);
export const separator = () => console.log(Array(process.stdout.columns + 1 || 50).join('~').gray);
