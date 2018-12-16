import log from '../helpers/log';
import {getSet} from './migrationLoader.js';

export const makeMigration = async(direction) => {
  log.info(`MIGRATIONS START WITH DIRECTION ${direction.toUpperCase()}`);
  let set;

  try {
     set = await getSet();
  } catch (err) {
    log.error(err);
  }

  log.debug('Set from migrate', set);
  set.on('migration', (migration, direction) => log.info(direction, migration.title));

  return set[direction]((err) => {
    if (err) throw err;
    log.info(`Migration ${direction} completed`);
  });
};
