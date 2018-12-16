import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';
import UserService from '../data/services/users';

passport.use(new LocalStrategy({
    usernameField: 'login',
    session: false
  },
  (login, password, cb) => {
    let userService = new UserService();
    userService
      .tryLogin({login, password})
      .then((result) => {
        cb(null, result);
      })
      .catch(cb);
  }));


export default passport;
