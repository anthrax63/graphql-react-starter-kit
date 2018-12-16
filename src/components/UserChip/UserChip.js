import React, {Component, PropTypes} from 'react';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import SvgIconFace from 'material-ui/svg-icons/action/face';

class UserChip extends Component {
  static propTypes = {
    user: PropTypes.shape({
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired
    }),
    deletable: PropTypes.bool,
    onRequestDelete: PropTypes.func
  };

  handleRequestDelete = () => {
    const {onRequestDelete} = this.props;
    if (onRequestDelete) {
      onRequestDelete();
    }
  };

  render() {
    const {
      user,
      deletable
    } = this.props;
    const {handleRequestDelete} = this;
    return (
      <Chip
        onRequestDelete={deletable ? handleRequestDelete : null}
        style={{
          marginTop: 8,
          marginRight: 8,
          float: 'left'
        }}
        labelStyle={{textOverflow: 'ellipsis', width: '180px', overflow: 'hidden'}}
        tooltip={'test'}
      >
        <Avatar color="#444" icon={<SvgIconFace />} />
        <span>{`${user.firstName} ${user.lastName}`}</span>
      </Chip>
    );
  }
}

export default UserChip;
