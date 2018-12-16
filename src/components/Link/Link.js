import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {navigate} from '../../actions/route';

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

class Link extends Component {
  static propTypes = {
    to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    simpleHref: PropTypes.bool,
    children: PropTypes.node,
    navigate: PropTypes.func.isRequired,
    newTab: PropTypes.bool,
    disabled: PropTypes.bool,
    onClick: PropTypes.function
  };


  handleClick = (event) => {
    let allowTransition = true;

    if (this.props.onClick) {
      this.props.onClick(event);
    }

    if (isModifiedEvent(event) || !isLeftClickEvent(event)) {
      return;
    }

    if (event.defaultPrevented === true) {
      allowTransition = false;
    }

    event.preventDefault();

    if (allowTransition) {
      if (this.props.to) {
        this.props.navigate(this.props.to);
      } else {
        this.props.navigate({
          pathname: event.currentTarget.pathname,
          search: event.currentTarget.search
        });
      }
    }
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
