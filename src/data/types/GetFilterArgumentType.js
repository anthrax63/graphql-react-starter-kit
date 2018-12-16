import {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID
} from 'graphql';

function getFilterArgumentType(baseName, inputType) {
  let filterType = !inputType.foreign ? inputType.type : GraphQLID;
  while (filterType.ofType) {
    filterType = filterType.ofType;
  }
  return new GraphQLInputObjectType({
    name: `${baseName}FilterArgument`,
    fields: {
      eq: {type: filterType},
      ne: {type: filterType},
      gt: {type: filterType},
      lt: {type: filterType},
      gte: {type: filterType},
      lte: {type: filterType},
      in: {type: new GraphQLList(filterType)},
      nin: {type: new GraphQLList(filterType)},
      inrange: {
        type: new GraphQLInputObjectType({
          name: `${baseName}RangeFilter`,
          fields: {
            from: {type: filterType},
            to: {type: filterType}
          }
        })
      },
      between: {
        type: new GraphQLInputObjectType({
          name: `${baseName}BetweenFilter`,
          fields: {
            from: {type: filterType},
            to: {type: filterType}
          }
        })
      },
      regex: {type: GraphQLString},
      iregex: {type: GraphQLString}
    }
  });
}


export default getFilterArgumentType;
