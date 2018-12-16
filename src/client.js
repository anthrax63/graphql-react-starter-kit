import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import FastClick from 'fastclick';
import UniversalRouter from 'universal-router';
import App from './components/App';
import {addLocaleData} from 'react-intl';
import en from 'react-intl/locale-data/en';
import ru from 'react-intl/locale-data/ru';
import routes from './routes';
import {logout as logoutAction} from './actions/login';
import {navigate as navigateAction} from './actions/route';
import {getMessage} from './actions/intl';
import {fetchCurrentUser} from './actions/me';
import createHistory from './core/createHistory';
import configureStore from './store/configureStore';
import {
  addEventListener,
  removeEventListener,
  windowScrollY
} from './core/DOMUtils';
import {unexpectedError} from './actions/errors';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {logError} from './helpers/log';
import Provide from './components/Provide';


// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

[en, ru].forEach(addLocaleData);

const context = {
  store: null,
  userAgent: navigator.userAgent,
  insertCss: (...styles) => {
    const removeCss = styles.map((style) => style._insertCss()); // eslint-disable-line no-underscore-dangle, max-len
    return () => {
      removeCss.forEach((f) => f());
    };
  },
  setMeta: (name, content) => {
    // Remove and create a new <meta /> tag in order to make it work
    // with bookmarks in Safari
    const elements = document.getElementsByTagName('meta');
    Array.from(elements).forEach((element) => {
      if (element.getAttribute('name') === name) {
        element.parentNode.removeChild(element);
      }
    });
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document
      .getElementsByTagName('head')[0]
      .appendChild(meta);
  }
};

// Restore the scroll position if it was saved into the state
function restoreScrollPosition({state, hash}) {
  if (state && state.scrollY !== undefined) {
    window.scrollTo(state.scrollX, state.scrollY);
    return;
  }

  const targetHash = hash && hash.substr(1);
  if (targetHash) {
    const target = document.getElementById(targetHash);
    if (target) {
      window.scrollTo(0, windowScrollY() + target.getBoundingClientRect().top);
      return;
    }
  }

  window.scrollTo(0, 0);
}

let renderComplete = (location, callback) => {
  const elem = document.getElementById('css');
  if (elem) elem.parentNode.removeChild(elem);
  callback(true);
  renderComplete = (l) => {
    restoreScrollPosition(l);

    // Google Analytics tracking. Don't send 'pageview' event after
    // the initial rendering, as it was already sent
    if (window.ga) {
      window.ga('send', 'pageview');
    }

    callback(true);
  };
};

function render(container, location, config, component) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(// eslint-disable-line no-console
        'React rendering. State:',
        config.store.getState()
      );
    }

    try {
      ReactDOM.render(
        <Provide {...config}>
          {component}
        </Provide>,
        container,
        renderComplete.bind(undefined, location, resolve)
      );
    } catch (err) {
      reject(err);
    }
  });
}

export default function main() {
  const history = createHistory();
  const container = document.getElementById('app');
  const initialState = JSON.parse(
    document
      .getElementById('source')
      .getAttribute('data-initial-state')
  );
  let currentLocation;

  let onRenderComplete = function initialRenderComplete() {
    const elem = document.getElementById('css');
    if (elem) elem.parentNode.removeChild(elem);
  };

  // Make taps on links and buttons work fast on mobiles
  FastClick.attach(document.body);

  const store = configureStore(initialState, {history});
  context.store = store;
  context.createHref = history.createHref;
  context.history = history;
  context.me = initialState.me;
  context.logout = () => store.dispatch(logoutAction());
  context.navigate = (descriptor) => store.dispatch(navigateAction(descriptor));
  context.updateMe = async() => {
    await store.dispatch(fetchCurrentUser());
  };

  // Re-render the app when window.location changes
  async function onLocationChange(location) {
    if (currentLocation && currentLocation.pathname === location.pathname) {
      return;
    }
    currentLocation = location;


    try {
      const route = await UniversalRouter.resolve(routes, {
        path: location.pathname,
        state: location.state,
        context,
        render: render.bind(undefined, container, location, {store}) // eslint-disable-line react/jsx-no-bind, max-len
      }).catch((err) => console.error(err)); // eslint-disable-line no-console

      context.title = route.title;
      document.title = store.dispatch(getMessage(route.title));
      if (location.pathname === '/login') {
        context.me = null;
      }
      if (!context.me || !context.me.login) {
        if (['/login', '/registration', '/help'].indexOf(location.pathname) === -1) {
          context.me = await store.dispatch(fetchCurrentUser());
        }
      }


      if (route.redirect) {
        history.push(route.redirect);
        return;
      }

      if (route.fetchData) {
        await route.fetchData({context, routeArgs: route.routeArgs});
      }


      ReactDOM.render(
        <App context={context} showLayout={route.showLayout}
             showGoBackBtn={route.showGoBackBtn}>{route.component}</App>,
        container,
        () => onRenderComplete(route, location)
      );
    } catch (e) {
      logError(e);
      store.dispatch(unexpectedError(`An unexpected error has occurred: ${e.message}`));
      if (e.redirect) {
        history.push(e.redirect);
      }
    }
  }

  // Add History API listener and trigger initial change
  const removeHistoryListener = history.listen(onLocationChange);
  history.replace(history.location);

  // https://developers.google.com/web/updates/2015/09/history-api-scroll-restoration
  let originalScrollRestoration;
  if (window.history && 'scrollRestoration' in window.history) {
    originalScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
  }

  // Prevent listeners collisions during history navigation
  addEventListener(window, 'pagehide', function onPageHide() {
    removeEventListener(window, 'pagehide', onPageHide);
    removeHistoryListener();
    if (originalScrollRestoration) {
      window.history.scrollRestoration = originalScrollRestoration;
      originalScrollRestoration = undefined;
    }
  });
}
