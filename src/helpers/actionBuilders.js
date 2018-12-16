import check from 'check-types';
import {handleError} from './errorHandler';
import {capitalize, deCapitalize} from './stringHelpers';
import {setFetchQuery} from './historyHelpers';
import {logError} from './log';

const convertArgs = (args, values) => {
  check.assert.assigned(args, '"args" is required');
  return {
    top: Object.keys(args).filter((k) => values && values[k] !== undefined).map((k) => `$${k}: ${args[k]}`),
    inner: Object.keys(args).filter((k) => values && values[k] !== undefined).map((k) => `${k}: $${k}`)
  };
};


const joinValues = (values) => {
  return values.map((v) => {
    if (typeof v === 'string') {
      return v;
    } else {
      return `${Object.keys(v)[0]} { ${joinValues(Object.values(v)[0])} }`;
    }
  }).join(', ');
};

const convertReturnValues = (values) => {
  check.assert.assigned(values, '"values" is required');
  check.assert.array(values, '"values" should be an array');
  return joinValues(values);
};

const uploadFile = async(file, {graphqlRequest, fileUploadRequest, history}) => {
  const query = `
    mutation {
      result: createFile {
          id,
          ready
      }
    }
    `;
  const getQuery = `
    query($id: ID!) {
      result: file(id: $id) {
        id,
        name,
        size,
        readySize,
        ready,
        link
      }
    }
  `;
  let response = await graphqlRequest(query, {});
  if (response.errors) {
    return handleError(response, {history});
  }
  const fileItem = response.data.result;
  await fileUploadRequest(fileItem.id, file);
  let uploadResultResponse = await graphqlRequest(getQuery, {id: fileItem.id});
  return uploadResultResponse.data.result;
};

/**
 * Converts input arguments from object to id of needed
 * @param values
 * @param args
 * @param graphqlRequest
 * @param fileUploadRequest
 * @param history
 */
const convertInputValues = async(values, args, {graphqlRequest, fileUploadRequest, history}) => {
  const newValues = {};
  const isFile = (value) => {
    return value instanceof File;
  };
  const keys = Object.keys(values);
  for (let k of keys) {
    let key = k;
    let value = values[k];
    if (value !== null && value !== undefined) {
      if (!args[key] && args[`${key}Id`]) {
        key = `${key}Id`;
        let type = args[key];
        if (type === 'ID' || type === 'ID!') {
          if (value.id) {
            value = value.id;
          } else if (isFile(value)) {
            let fileItem = await uploadFile(value, {graphqlRequest, fileUploadRequest, history});
            value = fileItem.id;
          }
        }
      }
      newValues[key] = value;
    }
  }
  return newValues;
};

/**
 * Creates an action for search items
 * @param {string} model Model name. Ex. 'worker'
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {string|Array} values String of values to return
 * @param {number} limit Limit result
 */
export function createSearchAction(model, actionTypes, values, limit = 10) {
  check.assert.nonEmptyString(model, '"model" should be non-empty string');
  check.assert.assigned(values, '"values" is required');
  check.assert.assigned(actionTypes, '"actionTypes" is required');
  check.assert.assigned(actionTypes.start, '"actionTypes.start" is required');
  check.assert.assigned(actionTypes.error, '"actionTypes.error" is required');
  check.assert.assigned(actionTypes.success, '"actionTypes.success" is required');
  const queryName = `${deCapitalize(model)}s`;
  const typeName = capitalize(model);
  const retValues = Array.isArray(values) ? convertReturnValues(values) : 'values';
  const query = `
    query ($searchString: String, $filter: ${typeName}Filter) {
      result: ${queryName}(textSearch: $searchString, filter: $filter ${limit ? `, limit: ${limit}` : ''}) {
        values {${retValues}}
      }
    }
  `;
  return (searchString, filterVars) => {
    return async(dispatch, getState, {graphqlRequest, history}) => {
      dispatch({type: actionTypes.start, payload: {searchString, filter: filterVars && {...filterVars}}});
      if (!searchString) {
        dispatch({type: actionTypes.success, payload: []});
      } else {
        let response = await graphqlRequest(query, {searchString, filter: filterVars && {...filterVars}});
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        dispatch({type: actionTypes.success, payload: response.data.result.values});
        return response.data.result.values;
      }
    };
  };
}


/**
 * Creates a save action
 * @param {string} model Model name. Ex. 'worker'
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {object} args Arguments that will be passed to the mutation. Ex.: {firstName: 'String!', lastName: 'String!'}
 * @param {boolean} replace If set, then object will be replaced instead of merge props. Default: true.
 * @param {Array.<string|object>} returnValues Values that should return query. Ex.: ['firstName', 'lastName', {video: ['link']}]
 */
export function createSaveAction(model, actionTypes, args, returnValues, replace = true) {
  const retValues = convertReturnValues(returnValues);
  const typeName = capitalize(model);
  return (values) => {
    check.assert.assigned(values, '"values" is required');
    check.assert.object(values, '"values" should be an object');
    return async(dispatch, getState, {graphqlRequest, fileUploadRequest, history}) => {
      const queryVars = await convertInputValues(values, args, {graphqlRequest, fileUploadRequest, history});
      const mutationArgs = convertArgs(args, queryVars);
      const replaceQuery = `
        mutation ($id: ID!, ${mutationArgs.top}) {
          result: replace${typeName}(id: $id, ${mutationArgs.inner}) { ${retValues} }
        }
      `;
      const mergeQuery = `
        mutation ($id: ID!, ${mutationArgs.top}) {
          result: merge${typeName}(id: $id, ${mutationArgs.inner}) { ${retValues} }
        }
      `;
      const insertQuery = `
        mutation (${mutationArgs.top}) {
          result: create${typeName}(${mutationArgs.inner}) { ${retValues} }
        }
      `;
      let query = values.id ? (replace ? replaceQuery : mergeQuery) : insertQuery;
      dispatch({type: actionTypes.start, payload: queryVars});
      try {
        let response = await graphqlRequest(query, queryVars);
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        dispatch({type: actionTypes.success, payload: response.data.result});
        return response.data.result;
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}

/**
 * Creates a get one item action
 * @param {string} model Model name. Ex. 'worker'
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {string} actionTypes.updateQuery
 * @param {Array.<string|object>} returnValues Values to return
 * @return {function(*=)}
 */
export function createGetAction(model, actionTypes, returnValues) {
  check.assert.nonEmptyString(model, '"model" should be non-empty string');
  check.assert.assigned(actionTypes, '"actionTypes" is required');
  check.assert.assigned(actionTypes.start, '"actionTypes.start" is required');
  check.assert.assigned(actionTypes.error, '"actionTypes.error" is required');
  check.assert.assigned(actionTypes.success, '"actionTypes.success" is required');
  const queryName = deCapitalize(model);
  const query = `
    query ($id: ID!) {
      result: ${queryName}(id: $id) {
        ${convertReturnValues(returnValues)}
      }
    }
  `;
  return (id) => {
    return async(dispatch, getState, {graphqlRequest, history}) => {
      dispatch({type: actionTypes.start, payload: id});
      try {
        let response = await graphqlRequest(query, {id});
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        let result = response.data.result;
        dispatch({type: actionTypes.success, payload: result});
        return result;
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}

/**
 * Creates an action for query items
 * @param {string} model Model name. Ex. 'worker'
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {string} actionTypes.updateQuery
 * @param {Array.<string|object>} returnValues Values to return
 * @param {string} filterDataValues String of values of filter data to return
 */
export function createQueryAction(model, actionTypes, returnValues, filterDataValues) {
  check.assert.nonEmptyString(model, '"model" should be non-empty string');
  check.assert.assigned(actionTypes, '"actionTypes" is required');
  check.assert.assigned(actionTypes.start, '"actionTypes.start" is required');
  check.assert.assigned(actionTypes.error, '"actionTypes.error" is required');
  check.assert.assigned(actionTypes.success, '"actionTypes.success" is required');
  check.assert.assigned(returnValues, '"returnValues" is required');
  const queryName = `${deCapitalize(model)}s`;
  const typeName = capitalize(model);
  const query = `
    query ($filter: ${typeName}Filter, $sort: ${typeName}Sort, $skip: Int, $limit: Int) {
      result: ${queryName}(filter: $filter, sort: $sort, skip: $skip, limit: $limit) {
        totalCount,
        values {${convertReturnValues(returnValues)}}
        ${filterDataValues && `filterData{${convertReturnValues(filterDataValues)}}` || ''}
      }
    }
  `;
  return (queryVars, updateHistory = true) => {
    return async(dispatch, getState, {graphqlRequest, history}) => {
      dispatch({type: actionTypes.start, payload: {...queryVars}});
      try {
        let response = await graphqlRequest(query, queryVars);
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        let result = response.data.result;
        dispatch({type: actionTypes.success, payload: result});
        dispatch({type: actionTypes.updateQuery, payload: queryVars});
        if (updateHistory) {
          setFetchQuery(queryVars, {history});
        }
        return response.data;
      } catch (e) {
        logError(e);
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}


/**
 * Creates an action for remove items
 * @param {string} model Model name. Ex. 'worker'
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @return {function(ids)}
 */
export function createRemoveAction(model, actionTypes) {
  check.assert.nonEmptyString(model, '"model" should be non-empty string');
  check.assert.assigned(actionTypes, '"actionTypes" is required');
  check.assert.assigned(actionTypes.start, '"actionTypes.start" is required');
  check.assert.assigned(actionTypes.error, '"actionTypes.error" is required');
  check.assert.assigned(actionTypes.success, '"actionTypes.success" is required');
  const typeName = capitalize(model);
  return (items) => {
    check.assert.assigned(items, '"items" is required');
    const ids = items.map((item) => item.id ? item.id : item);
    const query = `
      mutation ($ids: [ID!]) {
        result: remove${typeName}s(ids: $ids)
      }
    `;
    return async(dispatch, getState, {graphqlRequest, history}) => {
      dispatch({type: actionTypes.start, payload: {ids}});
      try {
        let response = await graphqlRequest(query, {ids});
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        dispatch({type: actionTypes.success, payload: response.data.result});
        return response.data.result;
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}

/**
 *
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {querySourceCallback} querySource
 * @return {createSetQueryAction~action}
 */
export function createSetQueryAction(actionTypes, querySource) {
  /**
   * Action function
   * @param {string} newQuery Query to merge
   * @return {function(*, *, {history: *})}
   */
  const action = (newQuery) => {
    return async(dispatch, getState, {history}) => {
      dispatch({type: actionTypes.start, payload: newQuery});
      try {
        const oldQuery = querySource(getState());
        let query = {
          ...oldQuery,
          ...newQuery
        };
        if (process.env.BROWSER) {
          const search = `?query=${JSON.stringify(query)}`;
          if (history.location.search !== search) {
            history.replace(`?query=${JSON.stringify(query)}`);
          }
        }
        dispatch({type: actionTypes.success, payload: query});
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
  return action;
}

/**
 *
 * @param {object} actionTypes Object that describes action types for start, success and error
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @return {createSetQueryAction~action}
 */
export function createFileUploadAction(actionTypes) {
  const query = `
    mutation {
      result: createFile {
          id,
          ready
      }
    }
    `;
  const getQuery = `
    query($id: ID!) {
      result: file(id: $id) {
        id,
        name,
        size,
        readySize,
        ready,
        link
      }
    }
  `;
  /**
   * Action function
   * @param {object} file File to upload
   * @return {function(*, *, {history: *})}
   */
  return (file) => {
    return async(dispatch, getState, {graphqlRequest, fileUploadRequest, history}) => {
      dispatch({type: actionTypes.start, payload: {}});
      let response = await graphqlRequest(query, {});
      if (response.errors) {
        dispatch({type: actionTypes.error, payload: response.errors});
        return handleError(response, {history});
      }
      const fileItem = response.data.result;
      try {
        await fileUploadRequest(fileItem.id, file);
        let uploadResultResponse = await graphqlRequest(getQuery, {id: fileItem.id});
        dispatch({type: actionTypes.success, payload: uploadResultResponse.data.result});
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}


/**
 * Creates custom action
 * @param {string} actionName
 * @param {object} actionTypes
 * @param {string} actionTypes.start
 * @param {string} actionTypes.error
 * @param {string} actionTypes.success
 * @param {object} args Arguments that will be passed to the mutation. Ex.: {firstName: 'String!', lastName: 'String!'}
 * @param {object} returnValues
 * @param {string} queryType
 * @return {function(*=)}
 */
export function createCustomAction(actionName, actionTypes, args, returnValues, queryType = 'mutation', callback) {
  const retValues = returnValues && convertReturnValues(returnValues);
  if (args && typeof args === 'object' && Object.keys(args).length === 0) {
    args = null;
  }
  return (values) => {
    if (values) {
      check.assert.object(values, '"values" should be an object');
    }
    return async(dispatch, getState, {graphqlRequest, fileUploadRequest, history}) => {
      const queryVars = values ? await convertInputValues(values, args, {graphqlRequest, fileUploadRequest, history}) : {};
      const mutationArgs = args && convertArgs(args, queryVars);
      const retValuesString = retValues ? `{ ${retValues} }` : '';
      const queryArgsStr = mutationArgs ? `(${mutationArgs.top})` : '';
      const mutationArgsStr = mutationArgs ? `(${mutationArgs.inner})` : '';
      const query = `
        ${queryType} ${queryArgsStr} {
          result: ${actionName} ${mutationArgsStr} ${retValuesString}
        }
      `;
      dispatch({type: actionTypes.start, payload: queryVars});
      try {
        let response = await graphqlRequest(query, queryVars);
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        dispatch({type: actionTypes.success, payload: response.data.result});
        if (callback) {
          callback(response.data.result, {graphqlRequest, fileUploadRequest, history});
        }
        return response.data.result;
      } catch (e) {
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}

/**
 * Create makeReport action
 * @export
 * @param {any} typeName
 * @param {any} actionName
 * @param {any} actionTypes
 * @param {any} returnValues
 * @returns
 */
export function createMakeReportAction(typeName, actionName, actionTypes, returnValues) {
  check.assert.nonEmptyString(typeName, '"typeName" should be non-empty string');
  check.assert.nonEmptyString(actionName, '"actionName" should be non-empty string');
  check.assert.assigned(actionTypes, '"actionTypes" is required');
  check.assert.assigned(actionTypes.start, '"actionTypes.start" is required');
  check.assert.assigned(actionTypes.error, '"actionTypes.error" is required');
  check.assert.assigned(actionTypes.success, '"actionTypes.success" is required');
  const query = `
    mutation ($filter: ${typeName}Filter, $sort: ${typeName}Sort, $skip: Int, $limit: Int) {
      result: ${actionName}(filter: $filter, sort: $sort, skip: $skip, limit: $limit) {
        ${convertReturnValues(returnValues)}
      }
    }
  `;
  return (queryVars, updateHistory = true) => {
    return async(dispatch, getState, {graphqlRequest, history}) => {
      dispatch({type: actionTypes.start, payload: {...queryVars}});
      try {
        if ('sort' in queryVars && Object.keys(queryVars.sort).length == 0) {
          delete queryVars.sort;
        }
        let response = await graphqlRequest(query, queryVars);
        if (response.errors) {
          dispatch({type: actionTypes.error, payload: {errors: response.errors}});
          return handleError(response, {history});
        }
        let result = response.data.result;
        dispatch({type: actionTypes.success, payload: result});
        if (updateHistory) {
          setFetchQuery(queryVars, {history});
        }
        return response.data;
      } catch (e) {
        logError(e);
        dispatch({type: actionTypes.error, payload: e});
      }
    };
  };
}
