import {handleError} from '../../helpers/errorHandler';

const actionPrefix = 'LOGIN';

export const ActionTypes = {
  login: {
    start: `${actionPrefix}_START`,
    success: `${actionPrefix}_SUCCESS`,
    error: `${actionPrefix}_ERROR`
  }
};

export function login({login, password}, redirectUrl) {
  const query = `
    mutation ($login: String!, $password: String!) {
      result: login (login: $login, password: $password) {
        result,
        token,
        expiresIn
      }
    }
  `;
  return async(dispatch, getState, {graphqlRequest, history}) => {
    dispatch({type: ActionTypes.login.start});
    const response = await graphqlRequest(query, {login, password});
    if (response.errors) {
      dispatch({type: ActionTypes.login.error, payload: {errors: response.errors}});
      return handleError(response, {history});
    }
    const {token, expiresIn} = response.data.result;
    if (document && document.cookie) {
      let expDate = new Date();
      expDate.setTime(expDate.getTime() + expiresIn * 1000);
      document.cookie = `id_token=${token};expires=${expDate.toUTCString()};path=/`;
    }
    dispatch({type: ActionTypes.login.success});
    history.replace(redirectUrl || '/');
  };
}
