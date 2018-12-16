import UserType from '../types/UserType';
import {mutationsMixin as crudMutationsMixin} from '../helpers/crudSchemaMixins';

export default {
  ...crudMutationsMixin({
    type: UserType,
    auth: {
      create: ['globalAdmin', 'globalAdminAnopchenko', 'schoolAdmin'],
      update: ['globalAdmin', 'globalAdminAnopchenko', 'schoolAdmin'],
      delete: ['globalAdmin', 'globalAdminAnopchenko', 'schoolAdmin']
    }
  })
};

