import {connect} from 'react-redux';
import UserInfo from '../../components/UserInfo';
import {bindActionCreators} from 'redux';
import * as actionCreators from '../UsersListContainer/actions';

const mapStateToProps = (state) => {
  return state.me;
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(actionCreators, dispatch);
};


export default connect(mapStateToProps, mapDispatchToProps)(UserInfo);
