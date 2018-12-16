import Crypto from 'crypto';
import CrudService from './crud';
import NotificationService from './notification/NotificationService';
import check from 'check-types';
import {UserAlreadyExistsError} from '../../constants/errors';
import log from '../../helpers/log';

const iterations = 99;
const digestLen = 512;
const algo = 'sha512';

function _getPasswordHash(password, salt) {
  return Crypto.pbkdf2Sync(password, salt, iterations, digestLen, algo).toString('base64');
}

function _checkPasswordHash(password, salt, hash) {
  log.debug('Check password hash', password, salt, hash);
  return new Buffer(hash, 'base64').compare(Crypto.pbkdf2Sync(password, salt, iterations, digestLen, algo)) === 0;
}

class UserService extends CrudService {
  /**
   * Constructs a new CRUD service based on User model
   */
  constructor() {
    super('User');
  }


  async create(obj) {
    const {login, type} = obj;
    if (type === 'local') {
      const existsUser = await this.getOne({login, type});
      if (existsUser) {
        throw new UserAlreadyExistsError({login});
      }
    }
    return super.create(this._updatePassword(obj));
  }

  replace(obj) {
    return super.replace(this._updatePassword(obj));
  }

  merge(obj) {
    return super.merge(this._updatePassword(obj));
  }

  /**
   * Finds user by login and password
   * @param {string} login
   * @param {string} password
   * @return {Promise.<boolean|object>}
   */
  tryLogin({login, password}) {
    log.debug('Try login', login, password);
    return this._model
      .findOne({login})
      .exec()
      .then((user) => {
        if (user) {
          if (_checkPasswordHash(password, user.passwordSalt, user.password)) {
            return user;
          }
        }
        return false;
      });
  }

  /**
   * Registers new user
   * @param {object} user
   * @param {string} user.login
   * @param {string} user.password
   * @param {string} user.firstName
   * @param {string} user.lastName
   * @param {string} [user.middleName]
   * @return {Promise<*>}
   */
  async register(user) {
    log.debug('register user', user);
    check.assert.nonEmptyString(user.login, '"login" is required');
    check.assert.nonEmptyString(user.password, '"password" is required');
    check.assert.nonEmptyString(user.firstName, '"firstName" is required');
    check.assert.nonEmptyString(user.lastName, '"lastName" is required');
    const result = await this.create({...user});
    const notificationService = new NotificationService();
    await notificationService.createUserActivationNotification(result._id);
    return result;
  }

  /**
   * Tries to activate the user by code
   * @param {string} code
   * @return {Promise<boolean>} True if user successfully activated, false in another case.
   */
  async activateUser(code) {
    log.debug('activate user', code);
    check.assert.nonEmptyString(code, '"code" is required');
    const user = await this.getOne({activationCode: code, type: 'local'});
    if (!user) {
      return false;
    }
    if (user.activated) {
      return true;
    }
    user.activated = true;
    await user.save();
    return true;
  }

  _updatePassword(obj) {
    if (!obj.password) {
      return obj;
    }
    const passwordSalt = Crypto.randomBytes(128).toString('base64');
    const password = _getPasswordHash(obj.password, passwordSalt);
    const newObj = {...obj, password, passwordSalt};
    return newObj;
  }
}

export default UserService;
