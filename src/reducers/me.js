import {
  FETCH_CURRENT_USER_START,
  FETCH_CURRENT_USER_ERROR,
  FETCH_CURRENT_USER_SUCCESS
} from '../constants';

export default function me(state = {}, action) {
  switch (action.type) {
    case FETCH_CURRENT_USER_START:
      return state;
    case FETCH_CURRENT_USER_ERROR:
      return state;
    case FETCH_CURRENT_USER_SUCCESS:
      return {
        ...state,
        ...action.payload
      };
  }
  return state;
}
