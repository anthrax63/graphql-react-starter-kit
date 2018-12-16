import {
  GraphQLNonNull
} from 'graphql';
import CustomGraphQLDateType from '../types/CustomGraphQLDateType';


export default function timestampsMixin() {
  return {
    createdAt: {type: new GraphQLNonNull(CustomGraphQLDateType), sort: true, filter: true, readonly: true},
    updatedAt: {type: new GraphQLNonNull(CustomGraphQLDateType), sort: true, filter: true, readonly: true}
  };
}
