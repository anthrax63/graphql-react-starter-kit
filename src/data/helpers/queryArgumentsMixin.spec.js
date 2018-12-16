import queryArgumentsMixin from './queryArgumentsMixin';
import chai from 'chai';
import {GraphQLString} from 'graphql';


describe('queryArgumentsMixin', () => {
  const should = chai.should();
  it('should return an object with 4 properties', () => {
    let result = queryArgumentsMixin('User', {
      firstName: {
        type: GraphQLString,
        filter: true,
        sort: true
      },
      lastName: {
        type: GraphQLString,
        filter: true
      },
      middleName: {
        type: GraphQLString,
        sort: true
      }
    });
    should.exist(result);
    should.exist(result.filter);
    should.exist(result.filter.type._typeConfig.fields.firstName);
    should.exist(result.filter.type._typeConfig.fields.lastName);
    should.not.exist(result.filter.type._typeConfig.fields.middleName);
    should.exist(result.sort);
    should.exist(result.sort.type._typeConfig.fields.firstName);
    should.not.exist(result.sort.type._typeConfig.fields.lastName);
    should.exist(result.sort.type._typeConfig.fields.middleName);
    should.exist(result.skip);
    should.exist(result.limit);
  });
});
