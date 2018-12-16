import MigrationState from './MigrationState.js';
import log from '../helpers/log';

class MigrationStateStore {
  save(set, done) {
    log.info('Save migrations state');
    const {lastRun, migrations} = set;
    MigrationState.findOneAndUpdate({}, {lastRun, migrations}, {new: true, upsert: true}, done);
  }

  async load() {
    log.info('Load migrations state');
    const store = (await MigrationState.findOne({})) || {};
    log.debug('Loaded migrations state store', store);
    if ('_id' in store) delete store._id;
    if ('__v' in store) delete store.__v;
    return store;
  }
}

export default MigrationStateStore;
