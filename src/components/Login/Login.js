import React, {PropTypes} from 'react';
import {defineMessages, intlShape} from 'react-intl';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Login.css';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

const messages = defineMessages({
  title: {
    id: 'login.title',
    defaultMessage: 'Login to Portal of Electronic Education Resources',
    description: 'Login to Portal of Electronic Education Resources'
  },
  message: {
    id: 'login.message',
    defaultMessage: 'Log in with your email and password',
    description: 'Log in message'
  },
  emailLabel: {
    id: 'login.emailLabel',
    defaultMessage: 'E-mail:',
    description: 'E-Mail label'
  },
  emailHint: {
    id: 'login.emailHint',
    defaultMessage: 'login@test.com',
    description: 'E-Mail label hint'
  },
  passwordLabel: {
    id: 'login.passwordLabel',
    defaultMessage: 'Password:',
    description: 'Password label'
  },
  passwordHint: {
    id: 'login.passwordHint',
    defaultMessage: 'Password',
    description: 'Password label hint'
  },
  buttonLabel: {
    id: 'login.buttonLabel',
    defaultMessage: 'Log In',
    description: 'Log in button label'
  },
  emailValidationError: {
    id: 'login.emailValidationError',
    defaultMessage: 'Invalid e-mail',
    description: 'E-mail validation message'
  },
  invalidLoginOrPasswordError: {
    id: 'login.invalidLoginOrPasswordError',
    defaultMessage: 'Invalid login or password',
    description: 'Invalid login or password'
  },
  fieldIsRequired: {
    id: 'login.fieldIsRequired',
    defaultMessage: 'Field is required',
    description: 'Field is required'
  },
  haveNoAccountQuestion: {
    id: 'login.haveNoAccountQuestion',
    defaultMessage: 'Have no account?',
    description: 'Have no account?'
  },
  dialogTitle: {
    id: 'login.dialogTitle',
    defaultMessage: 'Account activation information',
    description: 'Account activation information'
  },
  dialogText: {
    id: 'login.dialogText',
    defaultMessage: 'Please check your e-mail. Follow instructions in the email message to activate your account.',
    description: 'Please check your e-mail. Follow the link in the email message to activate your account.'
  }
});


class Login extends React.Component {
  static contextTypes = {
    store: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired
  };

  static propTypes = {
    intl: intlShape,
    redirectUrl: PropTypes.string,
    loggingIn: PropTypes.bool,
    login: PropTypes.func.isRequired
  };


  constructor(props) {
    super(props);
    this.state = {
      canSubmit: false,
      dialogOpened: true,
      values: {},
      errors: {}
    };
  }

  setValue = (name, value) => {
    this.setState((state) => ({
      ...state,
      values: {
        ...state.values,
        [name]: value
      }
    }));
  };

  validate = (values) => {
    const {intl: {formatMessage}} = this.props;
    const errors = {};
    ['login', 'password'].map((name) => {
      if (!values[name]) {
        errors[name] = formatMessage(messages.fieldIsRequired);
      }
    });
    this.setState((state) => ({
      ...state,
      errors
    }));
    return Object.keys(errors).length === 0;
  };

  handleLoginChange = (e, value) => {
    this.setValue('login', value);
  };

  handlePasswordChange = (e, value) => {
    this.setValue('password', value);
  };

  handleLoginButtonTouchTap = () => {
    const {values} = this.state;
    const {validate} = this;
    const {login, redirectUrl} = this.props;
    if (validate(values)) {
      login(values, redirectUrl);
    }
  };

  handleDialogClose = () => {
    this.setState({
      ...this.state,
      dialogOpened: false
    });
  };


  render() {
    const {intl: {formatMessage}, loggingIn} = this.props;
    const {errors} = this.state;
    const {handleLoginChange, handlePasswordChange, handleLoginButtonTouchTap, handleDialogClose} = this;
    const dialogActions = [
      <FlatButton
        label="OK"
        primary={true}
        onClick={handleDialogClose}
      />
    ];
    console.log('history', this.context.history);
    return (
      <div className={s.root}>
        <div className={s.container}>
          {
            this.context.history.location.hash && this.context.history.location.hash.indexOf('afterRegistration') !== -1 ?
              <Dialog
                title={formatMessage(messages.dialogTitle)}
                actions={dialogActions}
                modal={false}
                open={this.state.dialogOpened}
                onRequestClose={handleDialogClose}
              >
                {formatMessage(messages.dialogText)}
              </Dialog> : null
          }
          <h1>{formatMessage(messages.title)}</h1>
          <p>{formatMessage(messages.message)}</p>
          <div>
            <TextField
              id="login"
              fullWidth={true}
              floatingLabelText={formatMessage(messages.emailLabel)}
              hintText={formatMessage(messages.emailHint)}
              errorText={errors.login}
              onChange={handleLoginChange}
            />
          </div>
          <div>
            <TextField
              id="password"
              fullWidth={true}
              floatingLabelText={formatMessage(messages.passwordLabel)}
              hintText={formatMessage(messages.passwordHint)}
              errorText={errors.password}
              type="password"
              onChange={handlePasswordChange}
            />
          </div>
          <br/>
          {!loggingIn ?
            <RaisedButton
              label={formatMessage(messages.buttonLabel)}
              primary={true}
              fullWidth={true}
              onTouchTap={handleLoginButtonTouchTap}
            />
            :
            <CircularProgress className={s.loginProgress} size={36}/>
          }
          <br/>
          <LanguageSwitcher />
        </div>
      </div>
    );
  }
}


export default withStyles(s)(Login);
