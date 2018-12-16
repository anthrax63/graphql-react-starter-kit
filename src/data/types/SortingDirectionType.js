import {
  GraphQLEnumType
} from 'graphql';

const SortingDirectionType = new GraphQLEnumType({
  name: 'SortingDirection',
  values: {
    asc: {value: 'asc'},
    desc: {value: 'desc'}
  }
});

export default SortingDirectionType;
