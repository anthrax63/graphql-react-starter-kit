import React, {Component, PropTypes} from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import s from './AutoCompleteField.css';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import TextField from 'material-ui/TextField';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  startEnterToSearch: {
    id: 'autoCompleteField.startEnterToSearch',
    defaultMessage: 'Start enter to search...',
    description: 'Start enter to search'
  }
});

class AutoCompleteField extends Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

  static propTypes = {
    intl: intlShape,
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    hintText: PropTypes.string,
    disabled: PropTypes.bool,
    value: PropTypes.object,
    autoCompleteItems: PropTypes.arrayOf(PropTypes.object),
    fullWidth: PropTypes.bool,
    floatingLabelFixed: PropTypes.bool,
    converter: PropTypes.func,
    errorText: PropTypes.string,
    overlayRenderer: PropTypes.func,
    onAutoCompleteItemsRequested: PropTypes.func,
    onValueChanged: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      editMode: !props.value,
      searchText: '',
      isBlur: false,
      isDirty: false,
      value: props.value,
      dataSource: []
    };
  }

  getStateFromProps = (props) => {
    const {value: propsValue, autoCompleteItems, converter} = props;
    const value = propsValue;
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
      value,
      dataSource,
      editMode: !value
    };
  };

  renderDefaultOverlay = () => {
    const {value} = this.state;
    const {label, converter, fullWidth} = this.props;
    return <TextField
      floatingLabelText={label}
      value={value && (converter ? converter(value) : value)}
      fullWidth={fullWidth}
    />;
  };


  renderOverlay = () => {
    const {editMode, value} = this.state;
    const {overlayRenderer} = this.props;
    let className = `${s.overlayContainer} ${editMode ? s.overlayInvisible : s.overlayVisible}`;
    return (
      <div>
        {value ?
          <div>
            {
              overlayRenderer ?
                (<div
                  className={className}
                >
                  <div>
                    {value ? overlayRenderer(value) : ''}
                  </div>
                </div>)
                :
                this.renderDefaultOverlay()
            }</div> : ''
        }
      </div>
    );
  };

  renderAutoComplete = () => {
    const {handleUpdateInput, handleNewRequest, handleClose, handleBlur, handleFocus} = this;
    const {dataSource, searchText, editMode, value} = this.state;
    const {id, label, errorText, fullWidth, converter, floatingLabelFixed, hintText, intl: {formatMessage}, disabled} = this.props;
    return (
      <div>
        {
          <AutoComplete
            id={id}
            disabled={disabled}
            menuProps={{desktop: true, menuItemStyle: {whiteSpace: 'normal'}}}
            ref={(elem) => this.autoComplete = elem}
            dataSource={dataSource}
            dataSourceConfig={{
              text: 'text',
              value: 'value'
            }}
            hintText={hintText || formatMessage(messages.startEnterToSearch)}
            floatingLabelText={label}
            floatingLabelFixed={floatingLabelFixed}
            errorText={errorText}
            filter={AutoComplete.noFilter}
            openOnFocus={true}
            searchText={editMode ? searchText : (value ? converter(value) : '')}
            fullWidth={fullWidth}
            onUpdateInput={handleUpdateInput}
            onNewRequest={handleNewRequest}
            onClose={handleClose}
            onBlur={handleBlur}
            onFocus={handleFocus}
          />
        }
      </div>
    );
  };

  componentWillReceiveProps(props) {
    this.setState({
      ...this.state,
      ...this.getStateFromProps(props)
    });
  }

  handleUpdateInput = (searchText, dataSource, params) => {
    if (params.source === 'change') {
      const {onAutoCompleteItemsRequested} = this.props;
      if (onAutoCompleteItemsRequested) {
        onAutoCompleteItemsRequested(searchText);
      }
      this.setState({
        ...this.state,
        searchText
      });
    }
  };

  handleNewRequest = (searchText, index) => {
    const {dataSource} = this.state;
    const {onValueChanged} = this.props;
    let value;
    if (index >= 0) {
      value = dataSource[index].value;
    }
    this.setState({
      ...this.state,
      value,
      editMode: !value,
      isDirty: true
    });
    if (onValueChanged) {
      onValueChanged(value);
    }
  };

  handleClick = () => {
    this.setState({
      ...this.state,
      editMode: true,
      searchText: '',
      value: null
    });
    const {onValueChanged} = this.props;
    if (onValueChanged) {
      onValueChanged(null);
    }
    setTimeout(() => {
      this.autoComplete.setState({searchText: ''});
      this.autoComplete.focus();
    }, 0);
  };

  handleBlur = () => {
    setTimeout(() => {
      this.setState({
        ...this.state,
        isBlur: true,
        searchText: ''
      });
    }, 1000);
  };

  handleFocus = () => {
    this.setState({
      ...this.state,
      isBlur: false,
      searchText: ''
    });
  };

  render() {
    const {handleClick, renderAutoComplete} = this;
    return (
      <div onClick={handleClick} className={s.container}>
        <div className={s.inputContainer}>
          {renderAutoComplete()}
        </div>
      </div>
    );
  }
}

export default injectIntl(withStyles(s)(AutoCompleteField));
