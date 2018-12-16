import React, {Component, PropTypes} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Home.css';


const messages = defineMessages({
  welcome: {
    id: 'home.welcome',
    defaultMessage: 'Welcome to portal!',
    description: 'Welcome message'
  },
  instruction: {
    id: 'home.instruction',
    defaultMessage: 'Use left menu for navigation',
    description: 'Instruction message'
  }
});


class Home extends Component {
  static contextTypes = {
    me: PropTypes.object.isRequired
  };

  static propTypes = {
    intl: intlShape
  };

  constructor() {
    super();
    this.state = {
      accessTypes: ['online'],
      subject: null,
      grades: [1, 5]
    };
  }

  render() {
    const {intl} = this.props;
    return (
      <div className={s.root}>
        <span>{intl.formatMessage(messages.welcome)}</span>
      </div>
    );
  }
}

export default injectIntl(withStyles(s)(Home));
