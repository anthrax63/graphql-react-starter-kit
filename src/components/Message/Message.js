import React, {PropTypes} from 'react';
import {connect} from 'react-redux';
import Snackbar from 'material-ui/Snackbar';
import {closeMessage} from '../../actions/message';
import {FormattedMessage} from 'react-intl';

const getChildren = (message) => {
  if (!message.id) {
    return (<span>{message}</span>);
  }
  return (<FormattedMessage id={message.id}/>);
};

class ErrorMessage extends React.Component {
  static propTypes = {
    message: PropTypes.object,
    isVisible: PropTypes.bool.isRequired,
    children: PropTypes.node,
    autoHideDuration: PropTypes.number
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  handleRequestClose = () => {
    let {dispatch} = this.context.store;
    dispatch(closeMessage());
  };

  render() {
    const {props: {autoHideDuration, isVisible, message}, handleRequestClose} = this;
    return (
      <div>
        <Snackbar
          open={isVisible}
          message={(message && getChildren(message)) || ''}
          autoHideDuration={autoHideDuration || 3000}
          onRequestClose={handleRequestClose}
        />
      </div>
    );
  }
}

export const ErrorMessageComponent = ErrorMessage;

function mapStateToProps(state) {
  return {
    ...state.message
  };
}

export default connect(mapStateToProps)(ErrorMessage);
