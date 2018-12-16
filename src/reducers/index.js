import {combineReducers} from 'redux';
import runtime from './runtime';
import intl from './intl';
import login from './login';
import message from './message';
import me from './me';

import containers from '../containers/reducer';

export default combineReducers({
  runtime,
  intl,
  login,
  me,
  message,
  containers
});
