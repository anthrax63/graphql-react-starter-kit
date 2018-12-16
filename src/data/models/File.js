/* eslint-disable no-invalid-this */
import {Schema} from 'mongoose';

const FileSchema = new Schema({
  name: {type: String, index: true},
  size: {type: Number, index: true, default: 0},
  readySize: {type: Number, default: 0},
  ready: {type: Boolean, index: true, default: false}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

FileSchema
  .virtual('link')
  .get(function() {
    return this.ready ? `/files/${this.id}/${encodeURIComponent(this.name)}` : null;
  });


export default FileSchema;
