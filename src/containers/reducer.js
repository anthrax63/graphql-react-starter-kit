import {combineReducers} from 'redux';
import usersList from './UsersListContainer/reducer';


import login from './LoginContainer/reducer';

export default combineReducers({
  usersList,
  login
});
