import UserService from '../../data/services/users';

export const name = '1544963370168-default-user.js';
export const description = '';

const defaultUser = {
  login: 'user@user',
  password: 'q',
  firstName: 'John',
  lastName: 'Smith'
};

export const up = async() => {
  const service = new UserService();
  await service.register(defaultUser);
};

export const down = async() => {

};

export default {name, description, up, down};
