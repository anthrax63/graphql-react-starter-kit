import React, {Component, PropTypes} from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import TextField from 'material-ui/TextField';
import CommonInputLabel from '../CommonInputLabel';

const messages = defineMessages({
  labelFrom: {
    id: 'rangePicker.labelFrom',
    defaultMessage: 'From',
    description: 'Hint text of from field'
  },
  labelTo: {
    id: 'rangePicker.labelTo',
    defaultMessage: 'To',
    description: 'Hint text of to field'
  }
});


const inputStyle = {
  marginLeft: 8,
  marginRight: 8,
  width: 140
};

const containerStyle = {
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center'
};


class RangePicker extends Component {
  static propTypes = {
    intl: intlShape,
    value: PropTypes.shape({
      from: PropTypes.any,
      to: PropTypes.any
    }),
    valueRendererFrom: PropTypes.func,
    valueRendererTo: PropTypes.func,
    label: PropTypes.string,
    onValueChanged: PropTypes.func
  };

  static defaultProps = {
    value: {}
  };


  handleValueChanged = (field, changedValue) => {
    const {value, onValueChanged} = this.props;
    const newValue = {...value, [field]: changedValue};
    if (onValueChanged) {
      onValueChanged(newValue);
    }
  };

  renderDefaultInput = (field, value, label) => {
    const handleTextValueChanged = (e, newValue) => {
      handleValueChanged(field, newValue);
    };
    const {handleValueChanged} = this;
    return (
      <TextField
        hintText={label}
        value={value || ''}
        onChange={handleTextValueChanged}
        style={inputStyle}
      />
    );
  };


  render() {
    const {value, intl: {formatMessage}, valueRendererFrom, valueRendererTo, label} = this.props;
    const {renderDefaultInput, handleValueChanged} = this;

    return (
      <div>
        <CommonInputLabel text={label}/>
        <div style={containerStyle}>
          {valueRendererFrom ?
            valueRendererFrom(value, handleValueChanged.bind(this, 'from')) :
            renderDefaultInput('from', value.from, formatMessage(messages.labelFrom))}
          -
          {valueRendererTo ?
            valueRendererTo(value, handleValueChanged.bind(this, 'to')) :
            renderDefaultInput('to', value.to, formatMessage(messages.labelTo))}
        </div>
      </div>
    );
  }
}


export default injectIntl(RangePicker);
