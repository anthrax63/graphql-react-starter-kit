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
    return super.create(this._checkRolesAndUpdatePassword(obj));
  }

  replace(obj) {
    return super.replace(this._checkRolesAndUpdatePassword(obj));
  }

  merge(obj) {
    return super.merge(this._checkRolesAndUpdatePassword(obj));
  }

  /**
   * Finds user by login and password
   * @param {string} login
   * @param {string} password
   * @return {Promise.<boolean|object>}
   */
  tryLogin({login, password}) {
    return this._model
      .findOne({login, type: 'local', activated: true})
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

  async register(user) {
    log.debug('register user', user);
    check.assert.nonEmptyString(user.login, '"login" is required');
    check.assert.nonEmptyString(user.password, '"password" is required');
    check.assert.nonEmptyString(user.firstName, '"firstName" is required');
    check.assert.nonEmptyString(user.lastName, '"lastName" is required');
    check.assert.nonEmptyString(user.middleName, '"middleName" is required');
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

  _checkRolesAndUpdatePassword(obj) {
    let result = {};
    const accessRoles = obj.accessRoles || ['student'];
    ['regionAdmin', 'schoolAdmin', 'publisher', 'student'].forEach((role) => {
      let key = role.indexOf('Admin') > -1 ? role.slice(0, -5) : role;
      key = (role === 'student' || role === 'teacher') ? 'school' : key;
      const cond = key === 'school' ? ['student', 'teacher', 'schoolAdmin'].every((r) => accessRoles.indexOf(r) < 0) : accessRoles.indexOf(role) < 0;
      if (cond) {
        result[key] = null;
      } else {
        check.assert.assigned(obj[key], `Field "${key}" is required`);
      }
    });
    const data = {...obj, ...result};
    return this._updatePassword(data);
  }

  /**
   * Lists list by query
   * @param {object} query
   * @param {number} skip
   * @param {number} limit
   * @param {object} sort
   * @return {Promise.<object[]>}
   */
  list({query, skip, limit, sort}) {
    const {isGlobalAdmin, isSchoolAdmin, school} = this._user || {};
    if (school && isSchoolAdmin && !isGlobalAdmin) {
      query = {...query, school};
    }
    return super.list({query, skip, limit, sort});
  }

  count(query) {
    const {isGlobalAdmin, isSchoolAdmin, school} = this._user || {};
    if (query.query) {
      query = query.query;
    }
    if (school && isSchoolAdmin && !isGlobalAdmin) {
      query = {...query, school};
    }
    return super.count(query);
  }
}

export default UserService;
