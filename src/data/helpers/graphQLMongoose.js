import check from 'check-types';

const escapeRegExp = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

export async function graphQLQueryToMongoose(typeFields, args, parent) {
  const {filter, textSearch} = args;
  if (filter) {
    check.assert.object(filter, '"filter" should be an object');
  }
  if (textSearch) {
    check.assert.string(textSearch, '"textSearch" should be a string');
  }
  let mongooseQuery;
  if (filter) {
    mongooseQuery = {};
    let fields = Object.keys(filter);
    for (let i = 0; i < fields.length; i++) {
      let field = fields[i];
      let value = filter[field];
      let operator;
      const keys = Object.keys(value);
      for (let k of keys) {
        if (value[k] !== undefined) {
          operator = k;
          break;
        }
      }
      let valueObj = value[operator];
      if (field === 'id') {
        field = '_id';
      }
      if (field.endsWith('Id')) {
        field = field.slice(0, -2);
      }
      if (typeFields && typeFields[field] && typeFields[field].resolveFilter) {
        mongooseQuery = await typeFields[field].resolveFilter(valueObj, operator, mongooseQuery, parent, args);
      } else {
        switch (operator) {
          case 'eq':
            mongooseQuery[field] = {$eq: valueObj};
            break;
          case 'ne':
            mongooseQuery[field] = {$ne: valueObj};
            break;
          case 'gt':
            mongooseQuery[field] = {$gt: valueObj};
            break;
          case 'gte':
            mongooseQuery[field] = {$gte: valueObj};
            break;
          case 'lt':
            mongooseQuery[field] = {$lt: valueObj};
            break;
          case 'lte':
            mongooseQuery[field] = {$lte: valueObj};
            break;
          case 'in':
            mongooseQuery[field] = {$in: valueObj};
            break;
          case 'nin':
            mongooseQuery[field] = {$nin: valueObj};
            break;
          case 'regex':
            mongooseQuery[field] = new RegExp(valueObj);
            break;
          case 'iregex':
            mongooseQuery[field] = new RegExp(valueObj, 'i');
            break;
          case 'inrange': {
            let q = {};
            if (valueObj.from !== undefined) {
              q.$gte = valueObj.from;
            }
            if (valueObj.to !== undefined) {
              q.$lte = valueObj.to;
            }
            mongooseQuery[field] = q;
            break;
          }
          case 'between': {
            let q = {};
            if (valueObj.from) {
              q.$gt = valueObj.from;
            }
            if (valueObj.to) {
              q.$lt = valueObj.to;
            }
            mongooseQuery[field] = q;
            break;
          }
          default:
            throw new Error(`Invalid operator ${operator}`);
        }
      }
    }
  }
  let textSearchQuery;
  if (textSearch) {
    let orArray = [];
    const typeFieldsKeys = Object.keys(typeFields);
    let tsFieldCount = 0;
    typeFieldsKeys.forEach((key) => {
      if (typeFields[key].textSearch) {
        tsFieldCount++;
        orArray.push({
          [key]: new RegExp(`${escapeRegExp(textSearch)}`, 'i')
        });
      }
    });
    if (tsFieldCount === 0) {
      throw new Error('Requested entity does not contain any field for textSearch');
    }
    if (orArray.length > 0) {
      textSearchQuery = {$or: orArray};
    }
  }
  if (textSearchQuery && mongooseQuery) {
    return {
      $and: [mongooseQuery, textSearchQuery]
    };
  } else {
    return mongooseQuery || textSearchQuery || {};
  }
}

export function graphQLSortToMongoose(sort) {
  check.assert.object(sort, '"sort" should be an object');
  let mongooseSort = {};
  let fields = Object.keys(sort);
  fields.forEach((field) => {
    let value = sort[field];
    switch (value) {
      case 'asc':
        mongooseSort[field] = 1;
        break;
      case 'desc':
        mongooseSort[field] = -1;
        break;
    }
  });
  return mongooseSort;
}

export function graphQLLimitToMongoose(limit) {
  check.assert.number(limit, '"limit" should be a number');
  return limit;
}

export function graphQLSkipToMongoose(skip) {
  check.assert.number(skip, '"skip" should be a number');
  return skip;
}


export async function graphQLArgsToMongoose(fields, complexArgs, parent) {
  check.assert.object(complexArgs, '"complexArgs" should be an object');
  return {
    query: await graphQLQueryToMongoose(fields, complexArgs, parent),
    sort: complexArgs.sort && graphQLSortToMongoose(complexArgs.sort),
    skip: complexArgs.skip !== undefined && graphQLSkipToMongoose(complexArgs.skip),
    limit: complexArgs.limit !== undefined && graphQLLimitToMongoose(complexArgs.limit)
  };
}
