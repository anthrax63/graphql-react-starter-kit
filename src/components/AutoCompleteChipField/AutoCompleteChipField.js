import React, {Component, PropTypes} from 'react';
import ChipInput from 'material-ui-chip-input';
import s from './AutoCompleteChipField.css';

class AutoCompleteChipField extends Component {
  static propTypes = {
    name: PropTypes.string,
    label: PropTypes.string,
    values: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])).isRequired,
    autoCompleteItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.object])),
    converter: PropTypes.func,
    renderer: PropTypes.func,
    fullWidth: PropTypes.bool,
    onInputUpdate: PropTypes.func,
    onRequestAdd: PropTypes.func,
    onRequestDelete: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      values: [],
      isDirty: false
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      ...this.state,
      ...this.getStateFromProps(props)
    });
  }

  getStateFromProps = (props) => {
    const {values: propsValue, autoCompleteItems, converter} = props;
    const {values: stateValue, isDirty} = this.state;
    const values = isDirty ? stateValue : propsValue;
    let dataSource;
    if (!autoCompleteItems) {
      dataSource = [];
    } else {
      dataSource = autoCompleteItems.map((item) => {
        return {
          text: converter ? converter(item) : item.toString(),
          value: item
        };
      });
    }
    return {
      values,
      dataSource
    };
  };

  handleChipRender = ({value, text, isFocused, isDisabled, handleClick, handleRequestDelete, defaultStyle}, key) => {
    const {renderer} = this.props;
    if (renderer) {
      return renderer({value, text, isFocused, isDisabled, handleClick, handleRequestDelete, defaultStyle}, key);
    }
  };

  handleUpdateInput = (value) => {
    const {onInputUpdate} = this.props;
    if (onInputUpdate) {
      onInputUpdate(value);
    }
  };

  handleRequestAdd = (value, i) => {
    const {onRequestAdd} = this.props;
    if (onRequestAdd) {
      onRequestAdd(value);
    }
  };

  handleRequestDelete = (value) => {
    const {onRequestDelete} = this.props;
    if (onRequestDelete) {
      onRequestDelete(value);
    }
  };

  render() {
    const {values, renderer, fullWidth, name, label} = this.props;
    const {dataSource} = this.state;
    const {handleChipRender, handleUpdateInput, handleRequestAdd, handleRequestDelete} = this;
    return (
      <div className={s.chipInput}>
        <ChipInput
          id={`chipInput-${name}`}
          name={name}
          value={values}
          dataSource={dataSource}
          dataSourceConfig={{
            text: 'text',
            value: 'value'
          }}
          chipRenderer={renderer ? handleChipRender : null}
          fullWidth={fullWidth}
          floatingLabelText={label}
          newChipKeyCodes={[]}
          onUpdateInput={handleUpdateInput}
          onRequestAdd={handleRequestAdd}
          onRequestDelete={handleRequestDelete}
        />
      </div>
    );
  }
}

export default AutoCompleteChipField;
