import {GraphQLObjectType, GraphQLList, GraphQLID, GraphQLInt, GraphQLNonNull} from 'graphql';
import {getReferencingModels, getLinks} from './mongooseSchemaLinks';
import {deCapitalize} from '../../helpers/stringHelpers';

export default function linksMixin(typeName) {
  const fields = getReferencingModels(typeName);
  let keys = Object.keys(fields);
  let outFields = {};
  keys.forEach((field) => {
    outFields[deCapitalize(field)] = {
      type: new GraphQLList(GraphQLID)
    };
  });
  const typeFields = {
    totalCount: {
      type: new GraphQLNonNull(GraphQLInt)
    }
  };
  if (Object.keys(outFields).length > 0) {
    typeFields.refs = {
      type: new GraphQLObjectType({
        name: `${typeName}LinkRefs`,
        fields: outFields
      })
    };
  }
  return {
    links: {
      type: new GraphQLObjectType({
        name: `${typeName}Links`,
        fields: typeFields
      }),
      async resolve(parent, args) {
        return getLinks(typeName, parent);
      }
    }
  };
}
