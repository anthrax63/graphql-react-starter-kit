import check from 'check-types';
import mongoose from 'mongoose';
import {deCapitalize} from '../../helpers/stringHelpers';

// Map where property is referenced model and value is referencing models
const refs = {

};

function addRef(referencingModel, referencedModel, fieldName) {
  let ref = refs[referencedModel];
  if (!ref) {
    ref = {};
    refs[referencedModel] = ref;
  }
  let refFields = ref[referencingModel];
  if (!refFields) {
    refFields = [];
    ref[referencingModel] = refFields;
  }
  refFields.push(fieldName);
}

export function linksPlugin(schema, options) {
  check.assert.assigned(options, '"options" is required');
  check.assert.nonEmptyString(options.name, '"name" is required option');
  const {name} = options;
  schema.eachPath((pathName) => {
    const path = schema.paths[pathName];
    if (path.options.ref) {
      addRef(name, path.options.ref, pathName);
    }
  });
}

export function getReferencingModels(modelName) {
  return refs[modelName] || {};
}

export async function getLinks(modelName, props) {
  let id = props.id || props._id;
  if (!id) {
    return null;
  }
  const refs = getReferencingModels(modelName) || {};
  const refNames = Object.keys(refs);
  const refObj = {
    totalCount: 0,
    refs: {}
  };
  for (let refModelName of refNames) {
    const refFields = refs[refModelName];
    const query = refFields.map((f) => ({[f]: id}));
    const ids = await mongoose.model(refModelName).distinct('_id', {$or: query}).exec();
    refObj.totalCount += ids.length;
    refObj.refs[deCapitalize(refModelName)] = ids;
  }
  return refObj;
}
