import users from './users';
import login from './login';
import home from './home';
import error from './error';


export default {

  path: '/',

  // keep in mind, routes are evaluated in order
  children: [
    home,
    users,
    login,
    // place new routes before...
    error
  ],


  async action({next}) {
    return await next();
  }

};
