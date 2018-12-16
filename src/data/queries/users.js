import UserType from '../types/UserType';
import {queryMixin as crudQueryMixin} from '../helpers/crudSchemaMixins';

export default {
  ...crudQueryMixin({
    type: UserType
  })
};
