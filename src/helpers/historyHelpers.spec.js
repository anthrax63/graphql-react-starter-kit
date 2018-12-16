import createHistory from 'history/createMemoryHistory';
import {setFetchQuery, getFetchQuery} from './historyHelpers';
import chai from 'chai';
import url from 'url';

describe('historyHelpers', () => {
  const should = chai.should();
  describe('#setFetchQuery', () => {
    it('should set query string correctly', () => {
      const testQuery = {
        skip: 0,
        limit: 10,
        filter: {
          firstName: {gt: 'John'}
        },
        sort: {
          firstName: 'asc'
        }
      };
      const history = createHistory();
      history.push('/?test=1');
      setFetchQuery(testQuery, {history});
      const parsedUrl = url.parse(history.location.search, true);
      should.exist(parsedUrl.query);
      should.exist(parsedUrl.query.test);
      parsedUrl.query.test.should.be.equal('1');
      should.exist(parsedUrl.query.query);
      parsedUrl.query.query.should.be.equal(JSON.stringify(testQuery));
    });
  });

  describe('#getFetchQuery', () => {
    it('should parse query string correctly', () => {
      const history = createHistory();
      const testQuery = {
        skip: 0,
        limit: 10,
        filter: {
          firstName: {gt: 'John'}
        },
        sort: {
          firstName: 'asc'
        }
      };
      history.push('?query={"skip":0,"limit":10,"filter":{"firstName":{"gt":"John"}},"sort":{"firstName":"asc"}}');
      const query = getFetchQuery({history});
      query.should.be.deep.equal(testQuery);
    });

    it('should return undefined if query argument is not set', () => {
      const history = createHistory();
      history.push('?test=1');
      const query = getFetchQuery({history});
      should.not.exist(query);
    });
  });
});
