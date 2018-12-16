import log from '../helpers/log';
import MigrationSet from 'migrate/lib/set';
import Migration from 'migrate/lib/migration';
import MigrationStateStore from './stateStore';
import migrationList from './migrations';

const sortFn = (m1, m2) => {
  return m1.title > m2.title ? 1 : (m1.title < m2.title ? -1 : 0);
};

export const getSet = async() => {
  const store = new MigrationStateStore();
  const set = new MigrationSet(store);
  let state;

  try {
    state = await store.load();
  } catch(err) {
    log.error(err);
  }

  set.lastRun = state.lastRun || null;

  let migMap = {};
  let migrations = migrationList.map((item) => {
    log.debug('migration from migrationList', item);
    const {name, description, up, down} = item;
    const migration = new Migration(name, up, down, description);
    migMap[name] = migration;
    return migration;
  });

  state.migrations && state.migrations.forEach((m) => {
    if (!migMap[m.title]) {
      throw new Error('Missing migration file: ' + m.title);
    }
    migMap[m.title].timestamp = m.timestamp;
  });

  migrations = migrations.sort(sortFn);

  migrations.forEach(set.addMigration.bind(set));
  return set;
};
