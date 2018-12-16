import React, {Component, PropTypes} from 'react';
import DatePicker from 'material-ui/DatePicker';
import IconButton from 'material-ui/IconButton';
import ClearIcon from 'material-ui/svg-icons/content/clear';
import {injectIntl, defineMessages, intlShape} from 'react-intl';

const messages = defineMessages({
  cancelLabel: {
    id: 'cleanableDatePicker.cancelLabel',
    defaultMessage: 'Cancel',
    description: 'CleanableDatePicker cancel button label'
  }
});

const defaultDatePickerStyle = {
  display: 'flex',
  float: 'left'
};

class CleanableDatePicker extends Component {
  static propTypes = {
    intl: intlShape,
    id: PropTypes.string,
    label: PropTypes.string,
    minDate: PropTypes.instanceOf(Date),
    maxDate: PropTypes.instanceOf(Date),
    hintText: PropTypes.string,
    errorText: PropTypes.string,
    style: PropTypes.object,
    datePickerStyle: PropTypes.object,
    value: PropTypes.instanceOf(Date),
    onChange: PropTypes.func
  };

  static contextTypes = {
    muiTheme: PropTypes.object.isRequired
  };

  handleDateChange = (_, date) => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(date);
    }
  };

  handleCleanButtonTouchTap = () => {
    const {onChange} = this.props;
    if (onChange) {
      onChange(null);
    }
  };

  render() {
    const {id, minDate, maxDate, hintText, errorText, style, value, datePickerStyle, intl: {locale, formatMessage}, label} = this.props;
    const {handleDateChange, handleCleanButtonTouchTap} = this;
    const {muiTheme} = this.context;
    return (
      <div style={style}>
        <div>
          {label && <label style={{color: muiTheme.rawTheme.palette.disabledColor, fontSize: 14}}>{label}</label>}
        </div>
        <DatePicker
          id={id}
          autoOk={true}
          minDate={minDate}
          maxDate={maxDate}
          hintText={hintText}
          errorText={errorText}
          style={{
            ...defaultDatePickerStyle,
            ...(datePickerStyle || {})
          }}
          value={value}
          DateTimeFormat={Intl.DateTimeFormat}
          locale={locale}
          cancelLabel={formatMessage(messages.cancelLabel)}
          onChange={handleDateChange}
        />
        <IconButton onTouchTap={handleCleanButtonTouchTap} style={{width: 18, heigth: 18}}>
          <ClearIcon color={muiTheme.flatButton.primaryTextColor}/>
        </IconButton>
      </div>
    );
  }
}

export default injectIntl(CleanableDatePicker);
