import {AccessViolationError} from '../../constants/errors';

export const defaultAuth = {
  create: ['globalAdmin', 'globalAdminAnopchenko'],
  update: ['globalAdmin', 'globalAdminAnopchenko'],
  delete: ['globalAdmin', 'globalAdminAnopchenko'],
  read: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher', 'globalAdminAnopchenko', 'teacher']
};


export default function handleAuth(request, auth = {}, actionType = 'create') {
  if (!request.userInfo) {
    throw new AccessViolationError('Unknown user');
  }
}
