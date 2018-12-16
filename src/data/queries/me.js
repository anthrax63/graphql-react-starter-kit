import UserType from '../types/UserType';
import UserService from '../services/users';
import handleAuth from '../helpers/handleAuth';

const me = {
  type: UserType,
  async resolve({request}) {
    handleAuth(request, {}, 'read');
    let userService = new UserService();
    let {user} = request;
    return request.user && await userService.get({id: user.id});
  }
};

export default me;
