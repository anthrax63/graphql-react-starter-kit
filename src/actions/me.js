import {
  FETCH_CURRENT_USER_START,
  FETCH_CURRENT_USER_SUCCESS,
  FETCH_CURRENT_USER_ERROR
} from '../constants';
import {handleError} from '../helpers/errorHandler';

export function fetchCurrentUser() {
  const query = `
    query {
      me {
        id,
        login,
        firstName,
        lastName,
        photo {
          ready,
          link
        }
      }
    }
  `;
  return async(dispatch, getState, {graphqlRequest, history}) => {
    dispatch({type: FETCH_CURRENT_USER_START, payload: {}});
    let response = await graphqlRequest(query);
    if (response.errors) {
      dispatch({type: FETCH_CURRENT_USER_ERROR, payload: {errors: response.errors}});
      return handleError(response, {history});
    }
    dispatch({type: FETCH_CURRENT_USER_SUCCESS, payload: {...response.data.me, freeBalance: response.data.freeBalance}});
    return {...response.data.me, freeBalance: response.data.freeBalance};
  };
}
