import mongoose, {Schema} from 'mongoose';

const MigrationStateSchema = new Schema({
  lastRun: {type: String},
  migrations: {type: []}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

const migrationState = mongoose.model('MigrationState', MigrationStateSchema);

export default migrationState;
