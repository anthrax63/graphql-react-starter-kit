import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {navigate} from '../../actions/route';

class Link extends Component {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    simpleHref: PropTypes.bool,
    children: PropTypes.node,
    navigate: PropTypes.func.isRequired,
    newTab: PropTypes.bool,
    disabled: PropTypes.bool
  };

  render() {
    const {
      to,
      children,
      simpleHref,
      newTab
    } = this.props;
    return (
      <a href={to} onClick={(e) => {
        if (!simpleHref) {
          e.stopPropagation();
          e.preventDefault();
          this.props.navigate(to);
        }
      }} target={newTab ? '_blank' : '_self'}>
        {children}
      </a>
    );
  }
}

const mapState = null;

const mapDispatch = {
  navigate
};

export default connect(mapState, mapDispatch)(Link);
