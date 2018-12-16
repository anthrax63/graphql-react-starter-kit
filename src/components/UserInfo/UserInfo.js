import React, {PropTypes} from 'react';
import FontIcon from 'material-ui/FontIcon';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import FlatButton from 'material-ui/FlatButton';
import Avatar from 'material-ui/Avatar';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './UserInfo.css';


const messages = defineMessages({
  signOut: {
    id: 'userinfo.signout',
    defaultMessage: 'Sign out',
    description: 'Sign out button label'
  }
});


class UserInfo extends React.Component {
  static propTypes = {
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    photo: PropTypes.object,
    intl: intlShape
  };

  static contextTypes = {
    logout: PropTypes.func.isRequired
  };

  signOutButtonClick = () => {
    this.context.logout();
  };

  renderIcon = () => {
    const {photo} = this.props;
    if (photo && photo.ready) {
      return <Avatar
        src={photo.link}
        size={30}
      />;
    } else {
      return <FontIcon className="fa fa-user-circle" color={'white'}/>;
    }
  };

  render() {
    const {formatMessage} = this.props.intl;
    const {firstName, lastName} = this.props;
    const {renderIcon} = this;
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 4, marginLeft: 4}}>
        <IconMenu
          iconButtonElement={
            <FlatButton icon={renderIcon()}
                        label={`${firstName} ${lastName}`} style={{color: 'white'}}>
            </FlatButton>
          }
          anchorOrigin={{horizontal: 'right', vertical: 'bottom'}}
          targetOrigin={{horizontal: 'right', vertical: 'top'}}
          style={{color: 'white'}}
        >
          <MenuItem primaryText={formatMessage(messages.signOut)} onTouchTap={this.signOutButtonClick}/>
        </IconMenu>
      </div>
    );
  }
}

export default injectIntl(withStyles(s)(UserInfo));
