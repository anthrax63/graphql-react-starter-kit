import FileType from '../types/FileType';
import {queryMixin as crudQueryMixin} from '../helpers/crudSchemaMixins';


export default {
  ...crudQueryMixin({
    type: FileType,
    auth: {}
  })
};
