import React, {Component, PropTypes} from 'react';


const labelStyle = {
  fontSize: 12,
  color: 'rgba(0, 0, 0, 0.3)'
};


class CommonInputLabel extends Component {
  static propTypes = {
    text: PropTypes.string
  };


  render() {
    const {
      text
    } = this.props;
    return (
        <label style={labelStyle}>{text}</label>
    );
  }
}

export default CommonInputLabel;
