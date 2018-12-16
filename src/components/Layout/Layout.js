import React, {PropTypes} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Layout.css';
import MainMenu from '../MainMenu';
import AppBar from 'material-ui/AppBar';
import UserInfoContainer from '../../containers/UserInfoContainer';
import GoBackButton from '../GoBackButton';

const messages = defineMessages({
  appTitle: {
    id: 'core.appTitle',
    defaultMessage: 'Electronic educational resources of Moscow Region',
    description: 'Main application title'
  }
});

class Layout extends React.Component {
  static propTypes = {
    intl: intlShape,
    children: PropTypes.element.isRequired,
    currentPath: PropTypes.string.isRequired,
    title: PropTypes.object.isRequired,
    me: PropTypes.object.isRequired,
    navigate: PropTypes.func.isRequired,
    logout: PropTypes.func.isRequired,
    showGoBackBtn: PropTypes.boolean
  };

  static defaultProps = {
    showGoBackBtn: false
  };


  constructor() {
    super();
    this.state = {
      isMenuVisible: false
    };
  }

  handleSignOut = () => {
    this.props.logout();
  };

  handleNavigationRequest = (navTo) => {
    this.props.navigate(navTo);
  };


  toggleMenu = () => {
    this.setState({
      isMenuVisible: !this.state.isMenuVisible
    });
  };

  render() {
    const {currentPath, children, title, intl: {formatMessage}, showGoBackBtn} = this.props;
    const {isMenuVisible} = this.state;
    return (
      <div>
        <AppBar
          title={formatMessage(messages.appTitle)}
          iconElementRight=
            {
              <UserInfoContainer />
            }
          onLeftIconButtonTouchTap={this.toggleMenu}
          style={{position: 'fixed', top: 0}}
        />
        <MainMenu
          currentPath={currentPath}
          onNavigationRequested={this.handleNavigationRequest}
          onHideRequested={this.toggleMenu}
          isVisible={isMenuVisible}
        />
        <div style={{paddingTop: 50}}>
          <div style={{paddingLeft: 20, marginTop: 30}}>
            {showGoBackBtn ? <div><GoBackButton /></div> : null}
            <h2 style={{marginTop: 0}}>{formatMessage(title)}</h2>
          </div>
          {
            React.Children.only(children)
          }
        </div>
      </div>
    );
  }
}


export default withStyles(s)(injectIntl(Layout));
