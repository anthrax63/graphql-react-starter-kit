import {createToken} from './auth';
import chai from 'chai';
import {auth} from '../config';
import jwt from 'jsonwebtoken';


describe('auth', () => {
  const should = chai.should();
  describe('#createToken', () => {
    const tokenArgs = {
      id: 'id',
      login: 'login'
    };

    it('should check input arguments', () => {
      should.throw(() => createToken());
      should.throw(() => createToken({}));
      should.not.throw(() => createToken(tokenArgs));
    });

    it('should create token', () => {
      let token = createToken(tokenArgs);
      should.exist(token);
      should.exist(token.token);
      should.exist(token.expiresIn);
      token.token.should.be.a('string');
      token.expiresIn.should.be.a('number');
      token.expiresIn.should.equal(auth.tokenExpirationTime);
      let decoded = jwt.verify(token.token, auth.jwt.secret);
      should.exist(decoded.id);
      decoded.id.should.equal(tokenArgs.id);
      should.exist(decoded.login);
      decoded.login.should.equal(tokenArgs.login);
    });

    it('should accept custon expiration time', () => {
      const testExpTime = 60;
      let token = createToken({...tokenArgs, expiresIn: testExpTime});
      should.exist(token);
      should.exist(token.token);
      should.exist(token.expiresIn);
      token.token.should.be.a('string');
      token.expiresIn.should.be.a('number');
      token.expiresIn.should.equal(testExpTime);
    });
  });
});
