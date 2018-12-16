import FileType from '../types/FileType';
import {mutationsMixin as crudMutationsMixin} from '../helpers/crudSchemaMixins';

export default {
  ...crudMutationsMixin({
    type: FileType,
    auth: {
      create: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher', 'globalAdminAnopchenko'],
      update: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher', 'globalAdminAnopchenko'],
      delete: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher', 'globalAdminAnopchenko'],
      read: ['globalAdmin', 'regionAdmin', 'schoolAdmin', 'student', 'publisher', 'globalAdminAnopchenko']
    }
  })
};
