import {Schema} from 'mongoose';

const {ObjectId} = Schema.Types;


const UserSchema = new Schema({
  firstName: {type: String, required: true, trim: true, index: true},
  lastName: {type: String, required: true, trim: true, index: true},
  middleName: {type: String, trim: true, index: true},
  login: {type: String, required: true, lowercase: true, index: true},
  password: {type: String},
  passwordSalt: {type: String},
  photo: {type: ObjectId, ref: 'File'}
}, {
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});


export default UserSchema;
