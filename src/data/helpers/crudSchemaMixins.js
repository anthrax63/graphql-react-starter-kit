import {
  GraphQLList,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLID,
  GraphQLBoolean
} from 'graphql';
import handleAuth from './handleAuth';
import {graphQLArgsToMongoose} from './graphQLMongoose';
import queryArgumentsMixin from './queryArgumentsMixin';
import filterDataMixin from './filterDataMixin';
import linksMixin from './linksMixin';
import timestampsMixin from './timestampsMixin';
import {capitalize, deCapitalize} from '../../helpers/stringHelpers';
import check from 'check-types';
import log from '../../helpers/log';

const canOn = (arg, actionType, action) => {
  const prop = `${actionType}On`;
  const propValue = arg[prop];
  if (!propValue) {
    return true;
  }
  return propValue.indexOf(action) !== -1;
};

const canSetOn = (arg, action) => {
  return canOn(arg, 'set', action);
};

const canGetOn = (arg, action) => {
  return canOn(arg, 'get', action);
};

const canCreate = (arg) => {
  return canSetOn(arg, 'create');
};

const canUpdate = (arg) => {
  return canSetOn(arg, 'update');
};

const canView = (arg) => {
  return canGetOn(arg, 'view');
};

const filterFields = (obj, callback) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    let fieldValue = obj[key];
    if (callback(key, fieldValue)) {
      let newField = {...fieldValue};
      newObj[key] = newField;
    }
  });
  return newObj;
};

const convertForeign = (obj) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    let fieldValue = obj[key];
    let newField = {...fieldValue};
    if (fieldValue.foreign) {
      if (fieldValue.type.ofType) {
        newField.type = new GraphQLNonNull(GraphQLID);
      } else {
        newField.type = GraphQLID;
      }
      key = `${key}Id`;
    }
    newObj[key] = newField;
  });
  return newObj;
};

const clearRequired = (obj) => {
  const keys = Object.keys(obj);
  const newObj = {};
  keys.forEach((key) => {
    let fieldValue = obj[key];
    let newField = {...fieldValue};
    if (key !== 'id') {
      while (newField.type.ofType && !(newField.type instanceof GraphQLList)) {
        newField.type = newField.type.ofType;
      }
    }
    newObj[key] = newField;
  });
  return newObj;
};

export const restoreRefArgs = (args) => {
  let newArgs = {};
  Object.keys(args).forEach((k) => {
    let key = k;
    if (key.endsWith('Id') && key !== 'mosregId' /* Временный костыль*/) {
      key = key.slice(0, -2);
    }
    newArgs[key] = args[k];
  });
  return newArgs;
};

export function queryMixin({type, auth}) {
  check.assert.assigned(type, '"type" is required');
  const typeName = type.name;
  check.assert.nonEmptyString(typeName, '"type" should have "name"');
  const typeNameLower = deCapitalize(typeName);
  const typeNameCapitalized = capitalize(typeNameLower);
  const CrudService = type._typeConfig.service;
  const fields = type._typeConfig.fields;
  check.assert.assigned(CrudService, '"type" should have property "service"');
  check.assert.assigned(fields, '"type" should have fields');
  const fieldsForView = {
    ...filterFields(fields, (name, value) => canView(value)),
    ...timestampsMixin()
  };
  const newType = new GraphQLObjectType({
    name: `${typeNameCapitalized}View`,
    service: type.service,
    fields: {
      ...fieldsForView,
      ...linksMixin(typeNameCapitalized)
    }
  });
  return {
    [`${typeNameLower}s`]: {
      type: new GraphQLObjectType({
        name: `${typeNameCapitalized}sList`,
        fields: {
          totalCount: {type: new GraphQLNonNull(GraphQLInt)},
          values: {type: new GraphQLList(newType)},
          ...filterDataMixin(typeNameCapitalized, fields)
        }
      }),
      args: {
        ...queryArgumentsMixin(typeNameCapitalized, fieldsForView)
      },
      async resolve(parent, args) {
        if (auth) {
          handleAuth(parent.request, auth, 'read');
        }
        let service = new CrudService();
        let mongooseArgs = {...await graphQLArgsToMongoose(fieldsForView, args, parent)};
        log.debug('mongooseArgs', mongooseArgs);
        let totalCount = await service.count(mongooseArgs);
        let values = await service.list(mongooseArgs);
        return {
          totalCount,
          values,
          args
        };
      }
    },
    [`${typeNameLower}`]: {
      type: new GraphQLNonNull(newType),
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)}
      },
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'read');
        }
        let service = new CrudService();
        return await service.get(args);
      }
    }
  };
}

export function mutationsMixin({type, auth}) {
  check.assert.assigned(type, '"type" is required');
  const typeName = type.name;
  check.assert.nonEmptyString(typeName, '"type" should have "name"');
  const typeNameLower = deCapitalize(typeName);
  const typeNameCapitalized = capitalize(typeNameLower);
  const CrudService = type._typeConfig.service;
  const fields = type._typeConfig.fields;
  check.assert.assigned(CrudService, '"type" should have property "service"');
  const fieldsForCreate = {...convertForeign(filterFields(fields, (name, value) => name !== 'id' && canCreate(value)))};
  const fieldsForUpdate = {...convertForeign(filterFields(fields, (name, value) => canUpdate(value)))};
  const fieldsForMerge = {...convertForeign(clearRequired(filterFields(fields, (name, value) => canUpdate(value))))};
  return {
    [`create${typeNameCapitalized}`]: {
      type: type,
      args: fieldsForCreate,
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'create');
        }
        let service = new CrudService();
        return await service.create(restoreRefArgs(args));
      }
    },
    [`replace${typeNameCapitalized}`]: {
      type: type,
      args: fieldsForUpdate,
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'update');
        }
        let service = new CrudService();
        return await service.replace(restoreRefArgs(args));
      }
    },
    [`createOrReplace${typeNameCapitalized}`]: {
      type: type,
      args: fieldsForUpdate,
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'create');
        }
        let service = new CrudService();
        return await service.createOrReplace(restoreRefArgs(args));
      }
    },
    [`createOrMerge${typeNameCapitalized}`]: {
      type: type,
      args: fieldsForUpdate,
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'create');
        }
        let service = new CrudService();
        return await service.createOrMerge(restoreRefArgs(args));
      }
    },
    [`merge${typeNameCapitalized}`]: {
      type: type,
      args: fieldsForMerge,
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'update');
        }
        let service = new CrudService();
        return await service.merge(restoreRefArgs(args));
      }
    },
    [`remove${typeNameCapitalized}s`]: {
      type: GraphQLBoolean,
      args: {
        ids: {type: new GraphQLList(new GraphQLNonNull(GraphQLID))}
      },
      async resolve({request}, args) {
        if (auth) {
          handleAuth(request, auth, 'delete');
        }
        let service = new CrudService();
        return await service.remove(args.ids);
      }
    }
  };
}

