import React, {Component, PropTypes} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import KeyboardBackspace from 'material-ui/svg-icons/hardware/keyboard-backspace';

const messages = defineMessages({
  label: {
    id: 'goBackBtn.label',
    defaultMessage: 'Go Back',
    description: 'Go Back Button'
  }
});

const styles = {
  btn: {
    marginLeft: '-15px',
    marginBottom: 0
  }
};

class GoBackButton extends Component {
  static propTypes = {
    intl: intlShape,
    style: PropTypes.object
  };

  static contextTypes = {
    history: PropTypes.object
  };

  render() {
    const {intl: {formatMessage}, style} = this.props;
    const {history: {goBack}} = this.context;
    return (
      <FlatButton
        style={{...styles.btn, ...style}}
        label={formatMessage(messages.label)}
        icon={<KeyboardBackspace/>}
        onClick={goBack}
      />
    );
  }
}

export default injectIntl(GoBackButton);
