import check from 'check-types';
import {GraphQLInt, GraphQLInputObjectType, GraphQLString} from 'graphql';
import getFilterArgumentType from '../types/GetFilterArgumentType';
import SortingDirectionType from '../types/SortingDirectionType';


/**
 * Returns an object which can be used for mixing with graphQL query args
 * @param {string} baseName
 * @param {object} fields
 */
export default function queryArgumentsMixin(baseName, fields) {
  check.assert.nonEmptyString(baseName, '"baseName" should be a non empty string');
  check.assert.object(fields, '"fields" should be an object');
  let filterFields = {};
  let sortFields = {};
  let keys = Object.keys(fields);
  let hasTextSearchField = false;
  keys.forEach((field) => {
    let val = fields[field];
    let argBaseName = baseName + field.charAt(0).toUpperCase() + field.slice(1);
    check.assert.assigned(val.type, '"type" is required');
    if (val.foreign) {
      field = field + 'Id';
    }
    if (val.filter) {
      filterFields[field] = {type: getFilterArgumentType(argBaseName, val)};
    }
    if (val.sort) {
      sortFields[field] = {type: SortingDirectionType};
    }
    if (val.textSearch) {
      hasTextSearchField = true;
    }
  });
  let args = {
    filter: {
      type: new GraphQLInputObjectType({
        name: `${baseName}Filter`,
        fields: filterFields
      })
    },
    sort: {
      type: new GraphQLInputObjectType({
        name: `${baseName}Sort`,
        fields: sortFields
      })
    },
    skip: {
      type: GraphQLInt
    },
    limit: {
      type: GraphQLInt
    }
  };
  if (hasTextSearchField) {
    args.textSearch = {
      type: GraphQLString
    };
  }
  return args;
}
