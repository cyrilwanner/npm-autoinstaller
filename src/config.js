import fs from 'fs';
import merge from 'deepmerge';
import { rootPath } from './paths';

/**
 * specifies the default config
 */
const defaultConfig = {
  npm: {
    do: 'install',
    fallback: 'install',
    command: 'npm prune && npm install',
    files: ['package.json', 'npm-shrinkwrap.json']
  },
  bower: {
    do: 'install',
    fallback: 'install',
    command: 'bower install',
    files: ['bower.json']
  },
  composer: {
    do: 'install',
    fallback: 'install',
    command: 'composer install',
    files: ['compoer.json', 'composer.lock']
  },
  userConfig: 'autoinstaller.json'
};

/**
 * config for deep merging the default config with the user config
 */
const mergeConfig = {
  arrayMerge: (dest, source) => source
};

/**
 * load config
 *
 * @desc    load the npm-autoinstaller config from the package.json file and custom user configs
 * @return  {object}
 */
export const loadConfig = () => {
  return loadUserConfig(defaultConfig, 'package.json', 'autoinstaller');
};

/**
 * load user config
 *
 * @desc    load the config from the given file and merge it with the previous one
 * @param   {object} currentConfig - current config
 * @param   {file} file - filename of the user config
 * @param   {string} topLevelProp - name of the property in which the config is stored inside the file (optional)
 * @param   {boolean} recursive - if it should recursively load user configs (optional)
 * @return  {object}
 */
export const loadUserConfig = (currentConfig, file, topLevelProp = null, recursive = true) => {
  const fileContent = loadFile(file);

  // return current config if file does not exist
  if (fileContent === null) {
    return currentConfig;
  }

  const userConfig = topLevelProp === null ? fileContent : (fileContent[topLevelProp] || {});
  const mergedConfig = merge(currentConfig, userConfig, mergeConfig);

  if (mergedConfig.userConfig && mergedConfig.userConfig !== file && recursive) {
    return loadUserConfig(mergedConfig, mergedConfig.userConfig);
  }

  return mergedConfig;
};

/**
 * load file
 *
 * @desc    load and parse a json config file
 * @param   {string} file - path to the file in the project root
 * @return  {object}
 */
export const loadFile = (file) => {
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
