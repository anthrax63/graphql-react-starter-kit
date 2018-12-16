import url from 'url';
import {logError} from './log';

export function setFetchQuery(query, {history}) {
  const parsedUrl = url.parse(history.location.search, true);
  if (!parsedUrl.query) {
    parsedUrl.query = {};
  }
  let newQueryString = `${JSON.stringify(query)}`;
  if (parsedUrl.query.query !== newQueryString) {
    let newQuery = {
      ...parsedUrl.query,
      query: newQueryString
    };
    history.replace(url.format({...history.location, search: null, query: newQuery}), {reload: false});
  }
}

export function getFetchQuery({history}) {
  let query;
  const queryArgs = url.parse(history.location.search, true).query;
  if (queryArgs && queryArgs.query) {
    try {
      query = JSON.parse(queryArgs.query);
    } catch (e) {
      logError(e);
    }
  }
  return query;
}
