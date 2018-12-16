import check from 'check-types';
import {auth} from '../config';
import jwt from 'jsonwebtoken';


export function createToken({id, login, expiresIn}) {
  check.assert.assigned(id, '"id" is required');
  check.assert.nonEmptyString(login, '"login" should be non-empty string');
  if (expiresIn !== undefined) {
    check.assert.number(expiresIn, '"expiresIn" should be an integer');
  }
  let expTime = expiresIn || auth.tokenExpirationTime;
  let token = jwt.sign({id, login, type: 'user'}, auth.jwt.secret, {expiresIn: expTime});
  return {
    token,
    expiresIn: expTime
  };
}


export function createDeviceToken({serialNumber, expiresIn}) {
  check.assert.nonEmptyString(serialNumber, '"serialNumber" should be non-empty string');
  if (expiresIn !== undefined) {
    check.assert.number(expiresIn, '"expiresIn" should be an integer');
  }
  let expTime = expiresIn || auth.tokenExpirationTime;
  let token = jwt.sign({serialNumber, type: 'device'}, auth.jwt.secret, {expiresIn: expTime});
  return {
    token,
    expiresIn: expTime
  };
}
