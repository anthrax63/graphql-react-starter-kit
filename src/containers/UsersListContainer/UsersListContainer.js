import UsersList from '../../components/UsersList';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actionCreators from './actions';
import {getFetchQuery} from '../../helpers/historyHelpers';
import {injectIntl} from 'react-intl';


export const fetchData = async({context: {history, store: {dispatch}}}) => {
  let fetchQuery = getFetchQuery({history}) || {skip: 0, limit: 10};
  await dispatch(actionCreators.fetch(fetchQuery));
};


const mapStateToProps = (state) => {
  return {
    ...state.containers.usersList,
    me: state.me
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(actionCreators, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(UsersList));
