import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGOUT_START,
  LOGOUT_SUCCESS,
  LOGIN_SET_REDIRECT_URL
} from '../constants';
import {defineMessages} from 'react-intl';
import {showMessage} from './message';

const messages = defineMessages({
  invalidLoginOrPassword: {
    id: 'messages.invalidLoginOrPassword',
    defaultMessage: 'Invalid e-mail or password',
    description: 'Message that showing while user tries to login with invalid credentials'
  }
});

const query = `
  mutation ($login: String!, $password: String!) {
    login (login: $login, password: $password) {
      result,
      token,
      expiresIn
    }
  }
`;

export function setRedirectUrl(redirectUrl) {
  return async(dispatch) => {
    dispatch({type: LOGIN_SET_REDIRECT_URL, payload: redirectUrl});
  };
}

export function login({login, password, redirectUrl}) {
  return async(dispatch, getState, {graphqlRequest, history}) => {
    dispatch({type: LOGIN_START, payload: {login}});
    let response = await graphqlRequest(query, {login, password});
    let {result, token, expiresIn} = response.data.login;
    if (!result) {
      dispatch(showMessage({intlMessage: messages.invalidLoginOrPassword}));
      return dispatch({type: LOGIN_ERROR, payload: {login}});
    }
    // Set cookie
    if (document && document.cookie) {
      let expDate = new Date();
      expDate.setTime(expDate.getTime() + expiresIn * 1000);
      let cookie = `id_token=${token};expires=${expDate.toUTCString()};path=/`;
      document.cookie = cookie;
    }
    dispatch({type: LOGIN_SUCCESS, payload: {login, token, expiresIn}});
    history.replace(redirectUrl || '/');
  };
}


export function logout() {
  return async(dispatch, getState, {history}) => {
    dispatch({type: LOGOUT_START, payload: {}});
    // Set cookie
    if (document && document.cookie) {
      document.cookie = 'id_token=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    dispatch({type: LOGOUT_SUCCESS, payload: {}});
    history.push('/login');
  };
}


