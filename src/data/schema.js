import './models/index';

import {
  GraphQLSchema,
  GraphQLObjectType
} from 'graphql';

import intl from './queries/intl';
import me from './queries/me';
import userQueries from './queries/users';
import filesQueries from './queries/files';


import usersMutations from './mutations/users';
import loginMutations from './mutations/login';
import filesMutations from './mutations/files';


const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      intl,
      me,
      ...userQueries,
      ...filesQueries
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      ...usersMutations,
      ...loginMutations,
      ...filesMutations
    }
  })
});

export default schema;
