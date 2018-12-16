import {
  MESSAGE_SHOW,
  MESSAGE_CLOSE
} from '../constants';


export function showMessage({intlMessage}) {
  return async(dispatch) => {
    dispatch({type: MESSAGE_SHOW, payload: {intlMessage}});
  };
}

export function closeMessage() {
  return async(dispatch) => {
    dispatch({type: MESSAGE_CLOSE, payload: {}});
  };
}


