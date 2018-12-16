import {
  LOGIN_START,
  LOGIN_SUCCESS,
  LOGIN_ERROR,
  LOGIN_SET_REDIRECT_URL
} from '../constants';

export default function login(state = {isLoggedIn: false, isLoggingIn: false}, action) {
  switch (action.type) {
    case LOGIN_SET_REDIRECT_URL:
      return {
        ...state,
        redirectUrl: action.payload
      };
    case LOGIN_START:
      return {
        ...state,
        isLoggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: true
      };
    case LOGIN_ERROR:
      return {
        ...state,
        isLoggingIn: false,
        isLoggedIn: false
      };
  }
  return state;
}
