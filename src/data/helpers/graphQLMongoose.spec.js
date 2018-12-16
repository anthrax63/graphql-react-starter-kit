import {
  graphQLQueryToMongoose,
  graphQLSortToMongoose,
  graphQLLimitToMongoose,
  graphQLSkipToMongoose,
  graphQLArgsToMongoose
} from './graphQLMongoose';
import chai from 'chai';


describe('graphQLMongoose', () => {
  const should = chai.should();


  describe('#graphQLQueryToMongoose', () => {
    let filter = {
      firstName: {eq: 'John'},
      lastName: {ne: 'Smith'},
      dateOfBirth: {gt: '1917-01-01'},
      dateOfDeath: {lt: '1997-01-01'},
      compositions: {gte: 100},
      subscribers: {lte: 10000},
      roles: {in: ['admin', 'user']},
      city: {nin: ['Moscow', 'St. Petersburg']},
      nickname: {regex: '.*star.*'},
      googleLogin: {iregex: '.*brin.*'},
      rate: {inrange: {from: 0, to: 10}},
      age: {between: {from: 20, to: 60}}
    };

    let expectedMongooseQuery = {
      firstName: {$eq: 'John'},
      lastName: {$ne: 'Smith'},
      dateOfBirth: {$gt: '1917-01-01'},
      dateOfDeath: {$lt: '1997-01-01'},
      compositions: {$gte: 100},
      subscribers: {$lte: 10000},
      roles: {$in: ['admin', 'user']},
      city: {$nin: ['Moscow', 'St. Petersburg']},
      nickname: new RegExp('.*star.*'),
      googleLogin: new RegExp('.*brin.*', 'i'),
      rate: {$gte: 0, $lte: 10},
      age: {$gt: 20, $lt: 60}
    };

    it('should check input arguments', () => {
      should.throw(() => graphQLQueryToMongoose(null, {textSearch: {}}));
      should.throw(() => graphQLQueryToMongoose(null, {filter: 'string'}));
      should.throw(() => graphQLQueryToMongoose());
    });

    it('should convert graphQL query arguments to mongoose query', () => {
      let mongooseQuery = graphQLQueryToMongoose(null, {filter});
      should.exist(mongooseQuery);
      mongooseQuery.should.be.instanceOf(Object);
      mongooseQuery.should.deep.equal(expectedMongooseQuery);
    });
  });

  describe('#graphQLSortToMongoose', () => {
    let sort = {
      firstName: 'asc',
      lastName: 'desc'
    };

    let expectedMongooseSort = {
      firstName: 1,
      lastName: -1
    };

    it('should check input arguments', () => {
      should.throw(() => graphQLSortToMongoose());
      should.throw(() => graphQLSortToMongoose('string'));
      should.not.throw(() => graphQLSortToMongoose({}));
      should.not.throw(() => graphQLSortToMongoose(sort));
    });

    it('should convert graphQL sort arguments to mongoose sort', () => {
      let mongooseSort = graphQLSortToMongoose(sort);
      should.exist(mongooseSort);
      mongooseSort.should.be.instanceOf(Object);
      mongooseSort.should.deep.equal(expectedMongooseSort);
    });
  });

  describe('#graphQLLimitToMongoose', () => {
    it('should check input arguments', () => {
      should.throw(() => graphQLLimitToMongoose());
      should.throw(() => graphQLLimitToMongoose('string'));
      should.not.throw(() => graphQLLimitToMongoose(1));
    });

    it('should return limit value', () => {
      graphQLLimitToMongoose(1).should.equal(1);
    });
  });

  describe('#graphQLSkipToMongoose', () => {
    it('should check input arguments', () => {
      should.throw(() => graphQLSkipToMongoose());
      should.throw(() => graphQLSkipToMongoose('string'));
      should.not.throw(() => graphQLSkipToMongoose(1));
    });

    it('should return skip value', () => {
      graphQLSkipToMongoose(1).should.equal(1);
    });
  });

  describe('#graphQLArgsToMongoose', () => {
    let graphQLArgs = {
      filter: {
        firstName: {eq: 'John'},
        lastName: {ne: 'Smith'},
        dateOfBirth: {gt: '1917-01-01'},
        dateOfDeath: {lt: '1997-01-01'},
        compositions: {gte: 100},
        subscribers: {lte: 10000},
        roles: {in: ['admin', 'user']},
        city: {nin: ['Moscow', 'St. Petersburg']},
        nickname: {regex: '.*star.*'},
        rate: {inrange: {from: 0, to: 10}},
        age: {between: {from: 20, to: 60}}
      },
      sort: {
        firstName: 'asc',
        lastName: 'desc'
      },
      skip: 10,
      limit: 20,
      textSearch: 'textsearch'
    };

    let expectedMongooseArgs = {
      query: {$and: [
        {
          firstName: {$eq: 'John'},
          lastName: {$ne: 'Smith'},
          dateOfBirth: {$gt: '1917-01-01'},
          dateOfDeath: {$lt: '1997-01-01'},
          compositions: {$gte: 100},
          subscribers: {$lte: 10000},
          roles: {$in: ['admin', 'user']},
          city: {$nin: ['Moscow', 'St. Petersburg']},
          nickname: new RegExp('.*star.*'),
          rate: {$gte: 0, $lte: 10},
          age: {$gt: 20, $lt: 60}
        },
        {$or: [{
          firstName: new RegExp('^textsearch', 'i')
        }]}
      ]},
      sort: {
        firstName: 1,
        lastName: -1
      },
      skip: 10,
      limit: 20
    };

    const testType = {
      firstName: {
        textSearch: true
      }
    };

    it('should check input arguments', () => {
      should.throw(() => graphQLArgsToMongoose(null));
      should.throw(() => graphQLArgsToMongoose(null, 'string'));
      should.not.throw(() => graphQLArgsToMongoose(testType, graphQLArgs));
    });

    it('should return query properly', () => {
      let mongooseArgs = graphQLArgsToMongoose(testType, graphQLArgs);
      should.exist(mongooseArgs);
      mongooseArgs.should.be.instanceOf(Object);
      mongooseArgs.should.deep.equal(expectedMongooseArgs);
    });
  });
});
