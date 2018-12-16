import * as Consts from '../constants';
import {messages} from '../constants/errors';

const getErrorMessage = (errors) => {
  if (errors && errors[0] && errors[0].messageId) {
    return {id: errors[0].messageId};
  } else {
    return messages.unknownError;
  }
};


export default function message(state = {isVisible: false, children: null}, action) {
  switch (action.type) {
    case Consts.MESSAGE_SHOW:
      return {
        ...state,
        isVisible: true,
        message: action.payload.intlMessage
      };
    case Consts.MESSAGE_CLOSE:
      return {
        ...state,
        isVisible: false,
        children: null
      };
    case Consts.UNEXPECTED_ERROR:
      return {
        ...state,
        isVisible: true,
        message: action.payload
      };
  }
  if (action.type.endsWith('ERROR')) {
    return {
      ...state,
      isVisible: true,
      message: getErrorMessage(action.payload.errors)
    };
  }
  return state;
}
