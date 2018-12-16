import {ActionTypes} from './actions';

export default function(state = {}, action) {
  const {type} = action;
  switch (type) {
    case ActionTypes.login.start:
      return {
        ...state,
        loggingIn: true
      };
    case ActionTypes.login.success:
    case ActionTypes.login.error:
      return {
        ...state,
        loggingIn: false
      };
  }
  return state;
}
