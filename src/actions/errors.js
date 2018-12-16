import * as Consts from '../constants';

export function unexpectedError(text) {
  return async(dispatch) => {
    dispatch({type: Consts.UNEXPECTED_ERROR, payload: text});
  };
}
