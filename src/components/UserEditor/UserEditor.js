import React, {PropTypes} from 'react';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import FileUploader from '../../components/FileUploader';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import Checkbox from 'material-ui/Checkbox';

const messages = defineMessages({
  titleEdit: {
    id: 'userEditor.titleEdit',
    defaultMessage: 'Edit User',
    description: 'User editor dialog title'
  },
  titleAdd: {
    id: 'userEditor.titleAdd',
    defaultMessage: 'Add User',
    description: 'User editor dialog title'
  },
  email: {
    id: 'userEditor.email',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  emailHint: {
    id: 'userEditor.emailHint',
    defaultMessage: 'test@test.com',
    description: 'User e-mail hint text'
  },
  password: {
    id: 'userEditor.password',
    defaultMessage: 'Password',
    description: 'Password'
  },
  passwordRepeat: {
    id: 'userEditor.passwordRepeat',
    defaultMessage: 'Repeat password',
    description: 'Repeat password'
  },
  firstName: {
    id: 'userEditor.firstName',
    defaultMessage: 'First Name',
    description: 'User editor first name input label'
  },
  firstNameHint: {
    id: 'userEditor.firstNameHint',
    defaultMessage: 'John',
    description: 'User editor first name input hint'
  },
  lastName: {
    id: 'userEditor.lastName',
    defaultMessage: 'Last Name',
    description: 'User last name'
  },
  lastNameHint: {
    id: 'userEditor.lastNameHint',
    defaultMessage: 'Smith',
    description: 'User editor last name input hint'
  },
  middleName: {
    id: 'userEditor.middleName',
    defaultMessage: 'Middle Name',
    description: 'User editor first name input label'
  },
  middleNameHint: {
    id: 'userEditor.middleNameHint',
    defaultMessage: 'Van',
    description: 'User editor first name input hint'
  },
  photo: {
    id: 'userEditor.photo',
    defaultMessage: 'Photo',
    description: 'Photo'
  },
  saveButton: {
    id: 'userEditor.saveButton',
    defaultMessage: 'Save',
    description: 'Save button'
  },
  cancelButton: {
    id: 'userEditor.cancelButton',
    defaultMessage: 'Cancel',
    description: 'Cancel button'
  },
  errorFieldIsRequired: {
    id: 'userEditor.errorFieldIsRequired',
    defaultMessage: 'Field is required',
    description: 'Field is required'
  },
  errorEmailAlreadyExists: {
    id: 'userEditor.errorEmailAlreadyExists',
    defaultMessage: 'User with this e-mail already exists',
    description: 'Error message showing when existent e-mail written'
  },
  errorPasswordsNotMatch: {
    id: 'userEditor.errorPasswordsNotMatch',
    defaultMessage: 'Passwords don\'t match',
    description: 'Passwords don\'t match'
  }
});


class UserEditor extends React.Component {
  static propTypes = {
    intl: intlShape,
    value: PropTypes.shape({
      id: PropTypes.string,
      login: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string
    }),
    me: PropTypes.object.isRequired,
    isOpen: PropTypes.bool,
    save: PropTypes.func.isRequired,
    cancel: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      values: props.value || {activated: false},
      errors: {},
      isDirty: false
    };
  }

  setValue = (name, value) => {
    this.setState((state) => ({
      ...state,
      isDirty: true,
      values: {
        ...state.values,
        [name]: value
      }
    }));
  };

  validateValues = () => {
    const {values} = this.state;
    const {intl: {formatMessage}, value} = this.props;
    const editMode = !!(value && value.id);
    const errors = {};
    ['login', 'firstName', 'lastName', 'middleName', ...(!editMode ? ['password', 'passwordRepeat'] : [])].map((f) => {
      if (values[f] === undefined) {
        errors[f] = formatMessage(messages.errorFieldIsRequired);
      }
    });
    if (values.password) {
      if (values.password !== values.passwordRepeat) {
        errors.password = errors.passwordRepeat = formatMessage(messages.errorPasswordsNotMatch);
      }
    }
    this.setState((state) => ({
      ...state,
      errors
    }));
    return Object.keys(errors).length === 0;
  };

  handleSaveButtonTouchTap = () => {
    const {validateValues} = this;
    const {values} = this.state;
    const {save, value} = this.props;
    const editMode = !!(value && value.id);
    if (validateValues(values)) {
      const valuesToSave = {...values};
      if (editMode) {
        delete valuesToSave.login;
      }
      save(valuesToSave);
    }
  };

  handleCancelButtonTouchTap = () => {
    let {cancel} = this.props;
    cancel();
  };

  handleLoginChange = (e, value) => {
    this.setValue('login', value);
  };

  handlePasswordChange = (e, value) => {
    this.setValue('password', value);
  };

  handlePasswordRepeatChange = (e, value) => {
    this.setValue('passwordRepeat', value);
  };

  handleFirstNameChange = (e, value) => {
    this.setValue('firstName', value);
  };

  handleLastNameChange = (e, value) => {
    this.setValue('lastName', value);
  };

  handleMiddleNameChange = (e, value) => {
    this.setValue('middleName', value);
  };

  handleFileReady = (file) => {
    this.setValue('photo', file);
  };

  handleActivatedChange = (e, value) => {
    this.setValue('activated', value);
  };

  handleSchoolApprovedChange = (e, value) => {
    this.setValue('schoolApproved', value);
  };

  render() {
    const {
      intl: {formatMessage},
      value,
      isOpen
    } = this.props;
    const {isDirty, values, errors} = this.state;
    const editMode = !!(value && value.id);
    const {
      handleSaveButtonTouchTap,
      handleCancelButtonTouchTap,
      handleLoginChange,
      handlePasswordChange,
      handlePasswordRepeatChange,
      handleFirstNameChange,
      handleLastNameChange,
      handleMiddleNameChange,
      handleFileReady,
      handleActivatedChange,
      handleSchoolApprovedChange
    } = this;
    return (
      <div>
        <Dialog
          title={editMode ? formatMessage(messages.titleEdit) : formatMessage(messages.titleAdd)}
          actions={[
            <FlatButton
              label={formatMessage(messages.saveButton)}
              primary={true}
              disabled={!isDirty}
              onTouchTap={handleSaveButtonTouchTap}
            />,
            <FlatButton
              label={formatMessage(messages.cancelButton)}
              secondary={true}
              onTouchTap={handleCancelButtonTouchTap}
            />
          ]}
          modal={false}
          open={isOpen}
          onRequestClose={handleCancelButtonTouchTap}
          autoScrollBodyContent={true}
        >
          <div>
            <div style={{marginTop: 24}}>
              <Checkbox
                label={formatMessage(messages.activated)}
                checked={values.activated}
                onCheck={handleActivatedChange}
                disabled={values.type === 'mosreg'}
              />
            </div>
            <div style={{marginBottom: 8}}>
              <Checkbox
                label={formatMessage(messages.schoolApproved)}
                checked={values.schoolApproved}
                onCheck={handleSchoolApprovedChange}
                disabled={values.type === 'mosreg'}
              />
            </div>
            <div>
              <TextField
                floatingLabelText={formatMessage(messages.userType)}
                disabled={true}
                value={values.type === 'mosreg' ? formatMessage(messages.userTypeMosreg) : formatMessage(messages.userTypeLocal)}
              />
            </div>
            <div>
              {
                values.type === 'mosreg' ?
                  <TextField
                    floatingLabelText={formatMessage(messages.mosregId)}
                    disabled={true}
                    value={values.mosregId}
                  /> : null
              }
            </div>
            <div>
              <TextField
                floatingLabelText={formatMessage(messages.email)}
                hintText={formatMessage(messages.emailHint)}
                disabled={editMode}
                value={values.login}
                errorText={errors.login}
                onChange={handleLoginChange}
              />
            </div>
            <div>
              <TextField
                floatingLabelText={formatMessage(messages.lastName)}
                hintText={formatMessage(messages.lastNameHint)}
                errorText={errors.lastName}
                value={values.lastName}
                onChange={handleLastNameChange}
              />
            </div>
            <div>
              <TextField
                floatingLabelText={formatMessage(messages.firstName)}
                hintText={formatMessage(messages.firstNameHint)}
                errorText={errors.firstName}
                value={values.firstName}
                onChange={handleFirstNameChange}
              />
            </div>
            <div>
              <TextField
                floatingLabelText={formatMessage(messages.middleName)}
                hintText={formatMessage(messages.middleNameHint)}
                errorText={errors.middleName}
                value={values.middleName}
                onChange={handleMiddleNameChange}
              />
            </div>
            {
              !value.type || value.type === 'local' ?
                <div>
                  <div>
                    <TextField
                      floatingLabelText={formatMessage(messages.password)}
                      type="password"
                      errorText={errors.password}
                      value={values.password}
                      onChange={handlePasswordChange}
                    />
                  </div>
                  <div>
                    <TextField
                      floatingLabelText={formatMessage(messages.passwordRepeat)}
                      type="password"
                      errorText={errors.passwordRepeat}
                      value={values.passwordRepeat}
                      onChange={handlePasswordRepeatChange}
                    />
                  </div>
                </div> : null
            }
            <br/>
            <FileUploader
              label={formatMessage(messages.photo)}
              file={values.photo}
              onFileReady={handleFileReady}
            />
          </div>
        </Dialog>
      </div>
    );
  }
}

export default injectIntl(UserEditor);
