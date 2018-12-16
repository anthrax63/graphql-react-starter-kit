import React, {Component, PropTypes} from 'react';
import {defineMessages, intlShape, injectIntl} from 'react-intl';
import CleanableDatePicker from '../CleanableDatePicker';
import CommonInputLabel from '../CommonInputLabel';
import moment from 'moment';

const messages = defineMessages({
  hintFrom: {
    id: 'dateRangePicker.hintFrom',
    defaultMessage: 'From',
    description: 'Hint text of from field'
  },
  hintTo: {
    id: 'dateRangePicker.hintTo',
    defaultMessage: 'To',
    description: 'Hint text of to field'
  }
});

const datePickerStyle = {
  display: 'flex',
  float: 'left'
};

const datePickerFieldStyle = {
  marginLeft: 8,
  width: 81
};

const delimiterStyle = {
  display: 'flex',
  float: 'left',
  marginTop: 18,
  marginLeft: 9,
  marginRight: 0
};

class DateRangePicker extends Component {
  static propTypes = {
    intl: intlShape,
    label: PropTypes.string,
    dateFrom: PropTypes.instanceOf(Date),
    dateTo: PropTypes.instanceOf(Date),
    onDateRangeChanged: PropTypes.func
  };

  handleDateFromChange = (value) => {
    const {dateTo} = this.props;
    const dateFrom = value ? moment(value).startOf('date').toDate() : undefined;
    this.handleDateRangeChange(dateFrom, dateTo);
  };

  handleDateToChange = (value) => {
    const {dateFrom} = this.props;
    const dateTo = value ? moment(value).endOf('date').toDate() : undefined;
    this.handleDateRangeChange(dateFrom, dateTo);
  };

  handleDateRangeChange = (dateFrom, dateTo) => {
    const {onDateRangeChanged} = this.props;
    if (onDateRangeChanged) {
      onDateRangeChanged({dateFrom, dateTo});
    }
  };

  render() {
    const {dateFrom, dateTo, label, intl: {formatMessage}} = this.props;
    const {handleDateFromChange, handleDateToChange} = this;

    return (
      <div style={{marginTop: '16px'}}>
        <div>
          <CommonInputLabel text={label}/>
        </div>
        <CleanableDatePicker
          id="dateFrom"
          style={datePickerStyle}
          datePickerStyle={datePickerFieldStyle}
          value={dateFrom}
          maxDate={dateTo ? moment(dateTo).subtract(1, 'days').toDate() : null}
          hintText={formatMessage(messages.hintFrom)}
          onChange={handleDateFromChange}
        />
        <span style={delimiterStyle}>-</span>
        <CleanableDatePicker
          id="dateTo"
          style={datePickerStyle}
          datePickerStyle={datePickerFieldStyle}
          value={dateTo}
          minDate={dateFrom ? moment(dateFrom).add(1, 'days').toDate() : null}
          hintText={formatMessage(messages.hintTo)}
          onChange={handleDateToChange}
        />
      </div>
    );
  }
}

export const DateRangePickerComponent = DateRangePicker;

export default injectIntl(DateRangePicker);
