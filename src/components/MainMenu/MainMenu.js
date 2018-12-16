import React, {PropTypes} from 'react';
import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import AppBar from 'material-ui/AppBar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import IconButton from 'material-ui/IconButton';
import LanguageSwitcher from '../LanguageSwitcher';
import {injectIntl, defineMessages, intlShape} from 'react-intl';
import HelpIcon from 'material-ui/svg-icons/action/help';
import Link from '../Link';
import {white} from 'material-ui/styles/colors';

const messages = defineMessages({
  dashboard: {
    id: 'mainmenu.dashboard',
    defaultMessage: 'Dashboard',
    description: 'Dashboard menu item'
  },
  users: {
    id: 'mainmenu.users',
    defaultMessage: 'Users',
    description: 'Users menu item'
  }
});

class MainMenu extends React.Component {
  static propTypes = {
    intl: intlShape,
    currentPath: PropTypes.string.isRequired,
    isVisible: PropTypes.bool.isRequired,
    onNavigationRequested: PropTypes.func,
    onHideRequested: PropTypes.func
  };


  handleMenuItemTouchTap = (navTo) => {
    return () => {
      if (this.props.onNavigationRequested) {
        this.props.onNavigationRequested(navTo);
      }
      this.toggleDrawer();
    };
  };

  getMenuItemProps = (path) => {
    return {
      onTouchTap: this.handleMenuItemTouchTap(path),
      checked: this.props.currentPath === path
    };
  };

  toggleDrawer = () => {
    let {onHideRequested} = this.props;
    if (onHideRequested) {
      onHideRequested();
    }
  };

  render() {
    const {formatMessage} = this.props.intl;
    const {getMenuItemProps} = this;
    return (
      <Drawer width={300}
              openSecondary={false}
              open={this.props.isVisible}
              onToggleDrawer={this.toggleDrawer}
              onRequestChange={this.toggleDrawer}
              docked={false}>
        <AppBar
          iconElementLeft={<IconButton><NavigationClose/></IconButton>}
          onLeftIconButtonTouchTap={this.toggleDrawer}
        >
          <div style={{marginTop: 18}}>
            <Link to='/help' simpleHref={true} newTab={true}><HelpIcon color={white}/></Link>
          </div>
        </AppBar>
        <MenuItem {...getMenuItemProps('/users')} >{formatMessage(messages.users)}</MenuItem>
        <div style={{marginTop: 10, marginLeft: 10}}>
          <LanguageSwitcher/>
        </div>
      </Drawer>
    );
  }
}

export default injectIntl(MainMenu);
