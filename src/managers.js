import { config } from './config';
import { Manager } from './manager';

/**
 * get all managers
 *
 * @desc  create manager instances for all defined ones
 */
const getAllManagers = () => {
  const managers = [];

  for (const manager of Object.keys(config)) {
    try {
      managers.push(new Manager(manager));
    } catch (e) {}
  }

  return managers;
};

/**
 * get manager
 *
 * @desc    return a manager by its name
 * @param   {string} name - name of the manager
 * @return  {Manager}
 */
export const getManager = (name) => {
  return allManagers.find((manager) => manager.name === name);
};

export const allManagers = getAllManagers();
