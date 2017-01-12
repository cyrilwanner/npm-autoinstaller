import fs from 'fs';
import merge from 'deepmerge';
import { rootPath } from './paths';

/**
 * Specifies the default config
 */
const defaultConfig = {
  npm: {
    do: 'install',
    fallback: 'install',
    command: 'npm install'
  }
};

/**
 * load config
 *
 * @desc    load the npm-autoinstaller config from the package.json file
 * @return  {object}
 */
const loadConfig = () => {
  return merge(defaultConfig, (loadFile('package.json') || {}).autoinstaller || {});
};

/**
 * load file
 *
 * @desc    load and parse a json config file
 * @param   {string} file - path to the file in the project root
 * @return  {object}
 */
const loadFile = (file) => {
  const path = `${rootPath}/${file}`;
  if (!fs.existsSync(path)) {
    return null;
  }

  const content = fs.readFileSync(path);

  // parse the file
  try {
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
};

export const config = loadConfig();
