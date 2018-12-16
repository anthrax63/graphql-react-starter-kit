import UserService from '../data/services/users';

const userService = new UserService();

export default function(req, res, next) {
  if (!req.user) {
    return next();
  }
  userService
    .get(req.user.id)
    .then((user) => {
      if (!user) {
        throw new Error('User not found');
      }
      req.userInfo = user;
      next();
    })
    .catch((e) => {
      next(e);
    });
}
