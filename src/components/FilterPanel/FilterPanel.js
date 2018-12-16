import React, {PropTypes} from 'react';
import {Form as FormsyForm} from 'formsy-react';
import {Card, CardActions, CardHeader, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import AutoCompleteChipField from '../AutoCompleteChipField/AutoCompleteChipField';
import DateRangePicker from '../../components/DateRangePicker';
import RangePicker from '../../components/RangePicker';
import {FormsyText} from 'formsy-material-ui/lib';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './FilterPanel.css';
import _ from 'lodash';


const messages = defineMessages({
  label: {
    id: 'filterPanel.label',
    defaultMessage: 'Filter',
    description: 'Filter label'
  },
  buttonApply: {
    id: 'filterPanel.buttonApply',
    defaultMessage: 'Apply',
    description: 'Apply button text'
  },
  buttonReset: {
    id: 'filterPanel.buttonReset',
    defaultMessage: 'Reset',
    description: 'Reset button text'
  },
  stringQueryAnd: {
    id: 'filterPanel.stringQueryAnd',
    defaultMessage: 'AND',
    description: 'Operator name in the stringified query'
  },
  stringQueryContains: {
    id: 'filterPanel.stringQueryContains',
    defaultMessage: 'CONTAINS',
    description: 'Operator name in the stringified query'
  },
  stringQueryEquals: {
    id: 'filterPanel.stringQueryEquals',
    defaultMessage: '=',
    description: 'Operator name in the stringified query'
  },
  stringQueryIn: {
    id: 'filterPanel.stringQueryIn',
    defaultMessage: 'IN',
    description: 'Operator name in the stringified query'
  },
  stringQueryInRange: {
    id: 'filterPanel.stringQueryInRange',
    defaultMessage: 'IN RANGE',
    description: 'Operator name in the stringified query'
  },
  minusInfinity: {
    id: 'filterPanel.minusInfinity',
    defaultMessage: 'Minus infinity',
    description: 'Minus infinity query text'
  },
  plusInfinity: {
    id: 'filterPanel.plusInfinity',
    defaultMessage: 'Plus infinity',
    description: 'Plus infinity query text'
  },
  dateRangeFrom: {
    id: 'filterPanel.dateRangeFrom',
    defaultMessage: 'from',
    description: '"From" label of date range'
  },
  dateRangeTo: {
    id: 'filterPanel.dateRangeTo',
    defaultMessage: 'to',
    description: '"To" label of date range'
  },
  noFilter: {
    id: 'filterPanel.noFilter',
    defaultMessage: 'No filter is applied',
    description: 'No filter is applied'
  }
});

export const FieldShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['text', 'chip', 'dateRange', 'subject', 'setBox', 'range']),
  label: PropTypes.string.isRequired,
  condition: PropTypes.oneOf(['eq', 'contains', 'in', 'inrange']).isRequired,
  expanded: PropTypes.bool,
  setBoxComponent: PropTypes.any,
  rangeRendererFrom: PropTypes.func,
  rangeRendererTo: PropTypes.func
});


const escapeRegex = (str) => {
  return str
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\./g, '\\.')
    .replace(/\*/g, '\\*')
    .replace(/\?/g, '\\?');
};

const unescapeRegex = (str) => {
  return str
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\./g, '.')
    .replace(/\\\*/g, '*')
    .replace(/\\\?/g, '?');
};

const regexToValue = (regexStr) => {
  return unescapeRegex(regexStr.replace(/\(\.\*\)/g, ''));
};

const valueToRegex = (value) => {
  return `(.*)${escapeRegex(value)}(.*)`;
};

const getFilterValue = (filter, fieldName, condition) => {
  if (!filter) {
    return null;
  }
  let filterObj = filter[fieldName];
  if (!filterObj && filterObj !== false) {
    return null;
  }
  switch (condition) {
    case 'contains': {
      let value = filterObj.iregex;
      return value && regexToValue(value);
    }
    case 'eq':
      return filterObj.eq;
    case 'in':
      return filterObj.in;
    case 'inrange':
      return filterObj.inrange;
    default:
      throw new Error(`Unknown condition: ${condition}`);
  }
};

const setFilterValue = (filter, fieldName, condition, value) => {
  if (!value && value !== false) {
    if (filter[fieldName]) {
      delete filter[fieldName];
    }
    return;
  }
  if (!filter[fieldName]) {
    filter[fieldName] = {};
  }
  switch (condition) {
    case 'contains':
      filter[fieldName].iregex = valueToRegex(value);
      break;
    case 'eq':
      filter[fieldName].eq = value;
      break;
    case 'in':
      filter[fieldName].in = value;
      break;
    case 'inrange':
      filter[fieldName].inrange = value;
      break;
    default:
      throw new Error(`Unknown condition: ${condition}`);
  }
};


const getValuesFromFilter = (props) => {
  const {fields, filter} = props;
  let values = {};
  fields.forEach((f) => {
    values[f.name] = getFilterValue(filter, f.name, f.condition);
  });
  return values;
};

class FilterPanel extends React.Component {
  static propTypes = {
    intl: intlShape,
    filter: PropTypes.object.isRequired,
    filterData: PropTypes.object,
    fields: PropTypes.arrayOf(FieldShape).isRequired,
    onFilterChangeRequested: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      isDirty: false,
      values: {},
      filterData: props.filterData
    };
    this.state = this.getStateFromProps(props);
  }

  componentWillReceiveProps(props) {
    this.setState(this.getStateFromProps(props));
  }

  getStateFromProps = (props) => {
    const {isDirty} = this.state;
    let propValues = getValuesFromFilter(props);
    let currentValues = this.state.values;
    let newValues = {};
    let keys = _.union(Object.keys(currentValues), Object.keys(propValues));
    keys.forEach((k) => {
      let propValue = propValues[k];
      let currentValue = currentValues[k];
      if ((propValue !== null && propValue !== undefined) || (currentValue !== null && currentValue !== undefined)) {
        newValues[k] = isDirty ? currentValue : propValue;
      }
    });
    const newState = {
      ...this.state,
      values: newValues,
      expanded: props.expanded
    };
    return newState;
  };

  stringifyFilter = () => {
    const {props: {filter, filterData, intl: {formatMessage, formatDate}, fields}} = this;
    if (!filter) {
      return formatMessage(messages.noFilter);
    }
    let str = '';
    fields.forEach((f) => {
      let value = getFilterValue(filter, f.name, f.condition);
      let condText;
      switch (f.condition) {
        case 'eq':
          condText = formatMessage(messages.stringQueryEquals);
          if (f.converter && value) {
            let filterDataValue = filterData[f.name];
            if (filterDataValue) {
              const foundData = filterDataValue.find((fd) => fd.id === value);
              if (foundData) {
                value = f.converter(foundData);
              } else {
                value = f.converter(value);
              }
            }
          }
          break;
        case 'contains':
          condText = formatMessage(messages.stringQueryContains);
          break;
        case 'in':
          condText = formatMessage(messages.stringQueryIn);
          if (value) {
            let filterDataValue = filterData[f.name];
            if (f.converter) {
              value = value
                .map((id) => filterDataValue ? filterDataValue.find((fd) => id === fd.id) : id)
                .map((val) => {
                  if (!val) {
                    return '';
                  } else {
                    return f.converter(val);
                  }
                });
            }
            if (f.chipText) {
              value = value.map(f.chipText);
            }
          }
          break;
        case 'inrange':
          condText = formatMessage(messages.stringQueryInRange);
          if (value) {
            if (f.type === 'dateRange') {
              value =
                `${formatMessage(messages.dateRangeFrom)} ` +
                `${value.from && formatDate(value.from) || formatMessage(messages.minusInfinity)}` +
                ` ${formatMessage(messages.dateRangeTo)} ` +
                `${value.to && formatDate(value.to) || formatMessage(messages.plusInfinity)}`;
            } else {
              value =
                `${formatMessage(messages.dateRangeFrom)} ` +
                `${value.from && value.from || formatMessage(messages.minusInfinity)}` +
                ` ${formatMessage(messages.dateRangeTo)} ` +
                `${value.to && value.to || formatMessage(messages.plusInfinity)}`;
            }
          }
          break;
      }
      if (value || value === false) {
        str += `${str.length > 0 ? ` ${formatMessage(messages.stringQueryAnd)}` : ''} ("${f.label}" ${condText} ${JSON.stringify(value, null, 2)})`;
      }
    });
    if (str === '') {
      return formatMessage(messages.noFilter);
    }
    return str;
  };

  updateFilter = (values) => {
    const {fields, onFilterChangeRequested} = this.props;
    let newFilter = {};
    fields.forEach((f) => {
      setFilterValue(newFilter, f.name, f.condition, values[f.name]);
    });
    this.setState({
      ...this.state,
      isDirty: false
    }, () => {
      if (onFilterChangeRequested) {
        onFilterChangeRequested(newFilter);
      }
    });
    // this.setExpanded(false);
  };

  setExpanded = (expanded) => {
    this.setState({
      ...this.state,
      expanded
    });
    process.nextTick(() => {
      if (expanded) {
        this.setValues(getValuesFromFilter(this.props), false);
      }
    });
  };

  setValues = (values, makeDirty) => {
    this.setState({
      ...this.state,
      values,
      isDirty: !!makeDirty
    });
  };

  setValue = (name, value, makeDirty) => {
    const currentValues = this.state.values;
    const newValues = {
      ...currentValues,
      [name]: value
    };
    this.setValues(newValues, makeDirty);
  };


  renderField = (field, index) => {
    const {renderTextField, renderChipField, renderDateRangeField, renderSubjectField, renderSetBox, renderRangeField} = this;
    switch (field.type) {
      case 'chip':
        return renderChipField(field, index);
      case 'dateRange':
        return renderDateRangeField(field, index);
      case 'subject':
        return renderSubjectField(field, index);
      case 'setBox':
        return renderSetBox(field, index);
      case 'range':
        return renderRangeField(field, index);
      default:
        return renderTextField(field, index);
    }
  };

  renderTextField = (field, index) => {
    const {handleTextFieldKeyPress} = this;
    const {values} = this.state;
    return (
      <FormsyText floatingLabelText={field.label}
                  fullWidth={true}
                  onKeyPress={handleTextFieldKeyPress}
                  id={`textField${index}`}
                  key={`textField${index}`}
                  name={field.name}
                  value={values[field.name]}
      />);
  };

  handleSubjectUpdate = (fieldName, value) => {
    const newState = {
      ...this.state,
      values: {
        ...this.state.values,
        [fieldName]: value
      },
      isDirty: true
    };
    this.setState(newState);
  };

  handleArrayFieldUpdate = (fieldName, value) => {
    if (!Array.isArray(value) || value.length === 0) {
      value = null;
    }
    const newValue = value;
    if (value) {
      newValue.forEach((v, index) => {
        if (typeof v === 'object' && v.id) {
          newValue[index] = v.id;
        }
      });
    }
    const newState = {
      ...this.state,
      values: {
        ...this.state.values,
        [fieldName]: newValue
      },
      isDirty: true
    };
    this.setState(newState);
  };

  handleIdFieldUpdate = (fieldName, value) => {
    const {filterData} = this.state;
    if (value && typeof value === 'object' && value.id) {
      filterData[fieldName] = [value];
      value = value.id;
    }
    const newState = {
      ...this.state,
      values: {
        ...this.state.values,
        [fieldName]: value
      },
      isDirty: true
    };
    this.setState(newState);
  };

  renderSetBox = (field, index) => {
    const {handleArrayFieldUpdate, handleIdFieldUpdate} = this;
    const {values, filterData} = this.state;
    const value = values[field.name];
    const SetBox = field.setBoxComponent;
    const isArray = field.isArray !== false;
    let valueToRender = value;
    if (!isArray) {
      if (value && typeof value === 'string' && Array.isArray(filterData[field.name])) {
        const fd = filterData[field.name].filter((f) => f.id === value);
        if (fd && fd.length) {
          valueToRender = fd[0];
        }
      }
    }
    return (
      <SetBox
        label={field.label}
        isArray={isArray}
        showLabel={!!field.label}
        key={`setbox-field-${field.name}-${index}`}
        value={valueToRender}
        fullWidth={true}
        onValueChanged={isArray ? handleArrayFieldUpdate.bind(this, field.name) : handleIdFieldUpdate.bind(this, field.name)}
        {...field.props}
      />
    );
  };


  renderChipField = (field, index) => {
    const {values, filterData} = this.state;
    const valueIds = values[field.name] || [];
    const filterItems = filterData && filterData[field.name] || [];
    const value = valueIds.map((id) => {
      let item = filterItems.find((f) => f.id === id);
      return {
        text: field.converter(item),
        value: item
      };
    });
    return (
      <AutoCompleteChipField
        key={`autocompleteField${index}`}
        name={field.name}
        label={field.label}
        fullWidth={true}
        values={value || []}
        autoCompleteItems={field.autoCompleteItems}
        converter={field.converter}
        renderer={field.chipRenderer}
        onInputUpdate={field.onInputUpdate}
        onRequestAdd={(item) => {
          let mergedValue = [...(this.state.values[field.name] || []), item.value.id];
          const newState = {
            ...this.state,
            filterData: {
              ...this.state.filterData,
              [field.name]: [...this.state.filterData[field.name] || [], item.value]
            },
            values: {
              ...this.state.values,
              [field.name]: mergedValue
            },
            isDirty: true
          };
          this.setState(newState);
        }}
        onRequestDelete={({id}) => {
          let newValues = [...(this.state.values[field.name] || [])].filter((oldId) => oldId !== id);
          if (newValues.length === 0) {
            newValues = null;
          }
          this.setState({
            ...this.state,
            values: {
              ...this.state.values,
              [field.name]: newValues
            },
            isDirty: true
          });
        }}
      />
    );
  };

  renderDateRangeField = (field, index) => {
    const {values} = this.state;
    const value = values[field.name] || {from: undefined, to: undefined};
    const dateFrom = value.from && new Date(value.from);
    const dateTo = value.to && new Date(value.to);
    return (
      <DateRangePicker
        key={`dataRangeField-${index}`}
        label={field.label}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateRangeChanged={({dateFrom, dateTo}) => {
          let newValue;
          if (dateFrom || dateTo) {
            newValue = {};
            if (dateFrom) {
              newValue.from = dateFrom.toISOString();
            }
            if (dateTo) {
              newValue.to = dateTo.toISOString();
            }
          }
          this.setValue(field.name, newValue, true);
        }}
      />
    );
  };

  handleRangeFieldChange = (fieldName, value) => {
    if (value) {
      if ((value.from === '' || value.from === undefined || value.from === null) && (value.to === '' || value.to === undefined || value.to === null)) {
        value = null;
      } else {
        if (value.from === '' || value.from === null) {
          delete value.from;
        }
        if (value.to === '' || value.to === null) {
          delete value.to;
        }
      }
    }
    const newState = {
      ...this.state,
      values: {
        ...this.state.values,
        [fieldName]: value
      },
      isDirty: true
    };
    this.setState(newState);
  };

  renderRangeField = (field, index) => {
    const {handleRangeFieldChange} = this;
    const {values} = this.state;
    const value = values[field.name] || {from: undefined, to: undefined};
    const {rangeRendererFrom, rangeRendererTo} = field;
    return (
      <RangePicker
        value={value}
        onValueChanged={handleRangeFieldChange.bind(this, field.name)}
        valueRendererFrom={rangeRendererFrom}
        valueRendererTo={rangeRendererTo}
        label={field.label}
      />
    );
  };

  handleButtonApplyTouchTap = () => {
    this.refs.form.submit();
  };

  handleButtonResetTouchTap = () => {
    this.setValues({}, false);
    this.updateFilter({});
  };

  handleTextFieldKeyPress = (e) => {
    if (e.charCode === 13) {
      this.refs.form.submit();
    }
  };

  handleSubmit = (newValues) => {
    let {values} = this.state;
    let mergedValues = {
      ...values,
      ...newValues
    };
    this.updateFilter(mergedValues);
  };

  handleFormChange = (currentValues, isChanged) => {
    let isFilled = false;
    let keys = Object.keys(currentValues);
    for (let i = 0; i < keys.length; i++) {
      if (currentValues[keys[i]]) {
        isFilled = true;
        break;
      }
    }
    this.setState({
      ...this.state,
      isDirty: isFilled && isChanged
    });
  };

  handleExpandChange = (expanded) => {
    this.setExpanded(expanded);
  };

  render() {
    const {
      props: {intl: {formatMessage}, fields},
      state: {expanded, isDirty},
      stringifyFilter,
      renderField,
      handleButtonApplyTouchTap,
      handleButtonResetTouchTap,
      handleSubmit,
      handleFormChange,
      handleExpandChange
    } = this;
    const filterString = stringifyFilter();
    return (
      <div className={s.container}>
        <Card expanded={expanded} onExpandChange={handleExpandChange}>
          <CardHeader
            title={formatMessage(messages.label)}
            subtitle={filterString}
            actAsExpander={true}
            showExpandableButton={true}
          />
          <CardText expandable={true}>
            <div>
              <FormsyForm ref="form" onValidSubmit={handleSubmit} onChange={handleFormChange}>
                {fields.map(renderField)}
              </FormsyForm>
            </div>
          </CardText>
          <CardActions>
            <FlatButton
              label={formatMessage(messages.buttonApply)}
              primary={true}
              disabled={!expanded || !isDirty}
              onTouchTap={handleButtonApplyTouchTap}
            />
            <FlatButton
              label={formatMessage(messages.buttonReset)}
              secondary={true}
              onTouchTap={handleButtonResetTouchTap}
            />
          </CardActions>
        </Card>
        <br/>
      </div>
    );
  }
}


export default withStyles(s)(injectIntl(FilterPanel));
