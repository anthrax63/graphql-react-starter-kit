import Login from '../../components/Login';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actionCreators from './actions';
import {injectIntl} from 'react-intl';


const mapStateToProps = (state) => {
  return state.containers.login;
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(actionCreators, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(Login));
