import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';
import {linksPlugin} from '../helpers/mongooseSchemaLinks';

import File from './File';
import User from './User';
import Notification from './Notification';


const models = {
  File,
  User,
  Notification
};

Object.keys(models).forEach((modelName) => {
  const schema = models[modelName];
  schema.plugin(timestamp, {
    createdAt: {index: true},
    updatedAt: {index: true}
  });
  schema.plugin(linksPlugin, {name: modelName});
  mongoose.model(modelName, schema);
});


export default models;
