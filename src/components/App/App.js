import React, {Component, PropTypes} from 'react';
import emptyFunction from 'fbjs/lib/emptyFunction';
import s from './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import baseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Message from '../Message';
import Provide from '../Provide';
import Layout from '../Layout';

const getTheme = () => {
  let overwrites = {
    'palette': {
      'primary1Color': '#306c84',
      'primary2Color': '#00464c',
      'pickerHeaderColor': '#306c84'
    }
  };
  return getMuiTheme(baseTheme, overwrites);
};

class App extends Component {
  static propTypes = {
    context: PropTypes.shape({
      createHref: PropTypes.func.isRequired,
      store: PropTypes.object.isRequired,
      history: PropTypes.object.isRequired,
      socket: PropTypes.object,
      userAgent: PropTypes.string.isRequired,
      insertCss: PropTypes.func,
      setMeta: PropTypes.func,
      title: PropTypes.object,
      me: PropTypes.object.isRequired,
      updateMe: PropTypes.func.isRequired,
      logout: PropTypes.func.isRequired,
      navigate: PropTypes.func.isRequired
    }).isRequired,
    children: PropTypes.element.isRequired,
    showLayout: PropTypes.bool,
    showGoBackBtn: PropTypes.bool,
    error: PropTypes.object
  };

  static childContextTypes = {
    createHref: PropTypes.func.isRequired,
    insertCss: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    setMeta: PropTypes.func.isRequired,
    socket: PropTypes.object,
    muiTheme: PropTypes.object,
    me: PropTypes.object,
    updateMe: PropTypes.func,
    logout: PropTypes.func.isRequired
  };

  getChildContext() {
    const context = this.props.context;
    return {
      createHref: context.createHref,
      history: context.history,
      insertCss: context.insertCss || emptyFunction,
      setMeta: context.setMeta || emptyFunction,
      socket: context.socket || {on: emptyFunction},
      me: context.me,
      updateMe: context.updateMe,
      logout: context.logout
    };
  }

  componentWillMount() {
    const {insertCss} = this.props.context;
    this.removeCss = insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }


  render() {
    if (this.props.error) {
      return this.props.children;
    }
    let {showLayout, showGoBackBtn} = this.props;
    if (showLayout === undefined) {
      showLayout = true;
    }
    const {context: {me, logout, navigate, title, store}} = this.props;
    return (
      <Provide store={store}>
        <MuiThemeProvider muiTheme={getTheme()}>
          <div>
            {
              showLayout ?
                (
                  <Layout
                    title={title}
                    me={me}
                    logout={logout}
                    navigate={navigate}
                    showGoBackBtn={showGoBackBtn}
                    currentPath={this.props.context.history.location.pathname}
                  >
                    {this.props.children}
                  </Layout>
                ) :
                (
                  this.props.children
                )
            }
            <Message />
          </div>
        </MuiThemeProvider>
      </Provide>
    );
  }
}

export default App;
