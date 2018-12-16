import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLBoolean,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';

const TokenType = new GraphQLObjectType({
  name: 'Token',
  fields: {
    result: {type: new GraphQLNonNull(GraphQLBoolean)},
    token: {type: GraphQLString},
    expiresIn: {type: GraphQLInt}
  }
});

export default TokenType;
