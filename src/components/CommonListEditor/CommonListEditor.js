import React, {Component, PropTypes} from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  notDefined: {
    id: 'listEditor.notDefined',
    defaultMessage: 'Not defined',
    description: 'Not defined'
  },
  chooseFromTheList: {
    id: 'listEditor.chooseFromTheList',
    defaultMessage: 'Choose from the list...',
    description: 'Choose from the list...'
  }
});

class CommonListEditor extends Component {
  static propTypes = {
    intl: intlShape,
    label: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.any.isRequired
    })).isRequired,
    value: PropTypes.any,
    errorText: PropTypes.string,
    onValueChanged: PropTypes.func,
    fullWidth: PropTypes.bool,
    style: PropTypes.object,
    autoWidth: PropTypes.bool,
    multiple: PropTypes.bool
  };

  handleChange = (e, index, value) => {
    const {onValueChanged} = this.props;
    if (onValueChanged) {
      onValueChanged(value);
    }
  };

  render() {
    const {
      intl: {formatMessage},
      fullWidth,
      value,
      label,
      items,
      errorText,
      style,
      multiple,
      autoWidth
    } = this.props;
    const {handleChange} = this;
    const textValue = (value === undefined || value === null) ? '' : value;
    return (
      <SelectField
        autoWidth={autoWidth}
        floatingLabelFixed={true}
        fullWidth={fullWidth}
        floatingLabelText={label}
        hintText={formatMessage(messages.chooseFromTheList)}
        value={textValue}
        multiple={multiple}
        onChange={handleChange}
        errorText={errorText}
        style={style}
      >
        {multiple ? null : <MenuItem value={null} primaryText={formatMessage(messages.notDefined)}/>}
        {
          multiple ?
            items.map((item, index) => <MenuItem key={`list-editor-${index}`} value={item.value}
                                                 primaryText={item.label} insetChildren={true}
                                                 checked={value && value.indexOf(item.value) > -1}/>)
            :
            items.map((item, index) => <MenuItem key={`list-editor-${index}`} value={item.value}
                                                 primaryText={item.label}/>)
        }
      </SelectField>
    );
  }
}

export default injectIntl(CommonListEditor);
