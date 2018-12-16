import React, {Component, PropTypes} from 'react';
import Checkbox from 'material-ui/Checkbox';

const checkboxStyle = {
  marginTop: 8,
  marginRight: 20,
  display: 'inline-block',
  width: null
};


const labelStyle = {
  fontSize: 12,
  color: 'rgba(0, 0, 0, 0.3)'
};

const errorStyle = {
  fontSize: 12,
  color: 'rgb(244, 67, 54)',
  lineHeight: '12px'
};

const errorLineStyle = {
  borderTop: 'none rgb(244, 67, 54)',
  borderLeft: 'none rgb(244, 67, 54)',
  borderRight: 'none rgb(244, 67, 54)',
  borderBottom: '2px solid rgb(244, 67, 54)',
  width: '100%',
  marginBottom: 6,
  merginTop: 0
};

class CommonSetBox extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
    })).isRequired,
    value: PropTypes.arrayOf(PropTypes.any),
    errorText: PropTypes.string,
    onValueChanged: PropTypes.func
  };

  handleCheckboxCheck = (name, e, checked) => {
    const {value, onValueChanged} = this.props;
    if (checked) {
      onValueChanged([...(value || []), name]);
    } else {
      onValueChanged(value.filter((v) => v !== name));
    }
  };

  getIsChecked = (name) => {
    const {value} = this.props;
    return value && value.indexOf(name) !== -1;
  };

  render() {
    const {
      label,
      items,
      errorText
    } = this.props;
    const {handleCheckboxCheck, getIsChecked} = this;
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <br/>
        {
          items.map((item) => <Checkbox
            key={`setbox-item-${item.value}`}
            style={checkboxStyle}
            label={item.label}
            onCheck={handleCheckboxCheck.bind(this, item.value)}
            checked={getIsChecked(item.value)}
          />)
        }
        <div style={{height: 40, minHeight: 40, maxHeight: 40, overflow: 'hidden'}}>
        {
          errorText ?
          <div>
            <div>
              <hr style={errorLineStyle} />
            </div>
            <div style={errorStyle}>{errorText}</div>
          </div> :
          null
        }
        </div>
      </div>
    );
  }
}

export default CommonSetBox;
