import 'babel-polyfill';
import {
  port,
  auth,
  locales,
  storage,
  db,
  daemons,
  migrationsOnStart,
  migrationsDirection,
  mosreg
} from './config';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import requestLanguage from 'express-request-language';
import bodyParser from 'body-parser';
import expressJwt from 'express-jwt';
import expressGraphQL from 'express-graphql';
import ReactDOM from 'react-dom/server';
import UniversalRouter from 'universal-router';
import PrettyError from 'pretty-error';
import './serverIntlPolyfill';
import errorPageStyle from './routes/error/ErrorPage.css';
import passport from './core/passport';
import schema from './data/schema';
import routes from './routes';
import createHistory from './core/createHistory';
import userInfoMiddleware from './core/userInfoMiddleware';
import assets from './assets'; // eslint-disable-line import/no-unresolved
import configureStore from './store/configureStore';
import {setRuntimeVariable} from './actions/runtime';
import fileUploadMiddleware from './data/files/fileUploadMiddleware';
import {setLocale, getMessage} from './actions/intl';
import {fetchCurrentUser} from './actions/me';
import {createToken} from './core/auth';
import process from 'process';
import {InternalServerError} from './constants/errors';
import injectTapEventPlugin from 'react-tap-event-plugin';
import {logError, logInfo, logDebug} from './helpers/log';
import UserService from './data/services/users';
import mongoose from 'mongoose';
mongoose.Promise = global.Promise;
mongoose.connect(db.url);
injectTapEventPlugin();

import {makeMigration} from './migrate';
import Html from './components/Html';
import React from 'react';
import App from './components/App';
import {IntlProvider} from 'react-intl';
import {ErrorPageWithoutStyle} from './routes/error/ErrorPage';

if (migrationsOnStart) {
  makeMigration(migrationsDirection);
}

const app = express();

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';


//
// Register Node.js middleware
// -----------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());
app.use(requestLanguage({
  languages: locales,
  queryName: 'lang',
  cookie: {
    name: 'lang',
    options: {
      path: '/',
      maxAge: 3650 * 24 * 3600 * 1000 // 10 years in miliseconds
    },
    url: '/lang/{language}'
  }
}));
// app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
// app.use(cors({credentials: false}));

//
// Authentication
// -----------------------------------------------------------------------------
app.use(expressJwt({
  secret: auth.jwt.secret,
  credentialsRequired: false,
  getToken: (req) => req.cookies.id_token
}));
app.use(passport.initialize());
app.use(userInfoMiddleware);

if (__DEV__) {
  app.enable('trust proxy');
}
app.post('/login/local',
  passport.authenticate('local', {failureRedirect: '/login'}),
  (req, res) => {
    const tokenObj = createToken({id: req.user._id, login: req.user.login});
    res.cookie('id_token', tokenObj.token, {maxAge: 1000 * tokenObj.expiresIn, httpOnly: false});
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/login');
  });
});

app.get('/login/mosreg', (req, res) => {
  res.redirect(mosreg.authorizationUrl);
});

app.get('/login/mosreg/callback', (req, res) => {
  logDebug('/login/mosreg/callback', req.query);
  if (req.query.code) {
      const service = new UserService();
      service.tryLoginWithMosregCode(req.query.code)
        .then((user) => {
          logDebug('Mosreg user', user);
          const tokenObj = createToken({id: user._id, login: user.login});
          res.cookie('id_token', tokenObj.token, {maxAge: 1000 * tokenObj.expiresIn, httpOnly: false});
          res.redirect('/');
        })
        .catch((e) => {
          req.next(e);
        });
  } else {
    res.redirect('/login');
  }
});

app.post('/files/:id', fileUploadMiddleware);
app.use('/files', express.static(storage.path));


//
// Register API middleware
// -----------------------------------------------------------------------------
app.use('/graphql', expressGraphQL((req) => ({
  schema,
  graphiql: true,
  rootValue: {request: req},
  pretty: process.env.NODE_ENV !== 'production',
  formatError: (error) => {
    logError(error);
    let {originalError} = error;
    if (!originalError) {
      originalError = error;
    } else if (!originalError.messageId) {
      originalError = new InternalServerError(error);
    }
    return {
      code: originalError.code,
      messageId: originalError.messageId,
      message: originalError.message,
      data: originalError.data,
      path: error.path,
      locations: error.locations
    };
  }
})));


app.listen(port, () => {
  logInfo(`The server is running at http://localhost:${port}/`);
});


logDebug('ENABLED DAEMONS', daemons.enabledDaemons);
for (let daemon of daemons.enabledDaemons) {
  require(`./daemons/${daemon}Daemon`);
}


let statusCode = 200;
//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
app.get('*', async(req, res, next) => {
  const history = createHistory();
  history.push(req.url);
  // let currentLocation = history.getCurrentLocation();
  let sent = false;
  const removeHistoryListener = history.listen((location) => {
    const newUrl = `${location.pathname}${location.search}`;
    if (req.originalUrl !== newUrl) {
      // console.log(`R ${req.originalUrl} -> ${newUrl}`); // eslint-disable-line no-console
      if (!sent) {
        res.redirect(303, newUrl);
        sent = true;
        next();
      } else {
        console.error(`${req.path}: Already sent!`); // eslint-disable-line no-console
      }
    }
  });

  try {
    let initialState = {};
    const store = configureStore(initialState, {
      cookie: req.headers.cookie,
      history
    });

    store.dispatch(setRuntimeVariable({
      name: 'initialNow',
      value: Date.now()
    }));
    let css = new Set();
    const locale = req.language;
    const data = {
      lang: locale,
      title: '',
      description: '',
      style: '',
      script: assets.main.js,
      children: ''
    };

    store.dispatch(setRuntimeVariable({
      name: 'availableLocales',
      value: locales
    }));

    store.dispatch(setRuntimeVariable({
      name: 'serverDate',
      value: new Date()
    }));

    await store.dispatch(setLocale({
      locale
    }));


    const context = {
      store,
      userAgent: req.headers['user-agent'],
      createHref: history.createHref,
      history: history,
      go: history.push,
      insertCss: (...styles) => {
        styles.forEach((style) => css.add(style._getCss())); // eslint-disable-line no-underscore-dangle, max-len
      },
      setMeta: (key, value) => (data[key] = value),
      logout: () => {
      },
      navigate: () => {
      },
      updateMe: async() => {
        context.me = await store.dispatch(fetchCurrentUser());
      }
    };
    const route = await UniversalRouter.resolve(routes, {
      path: req.path,
      context
    });
    context.title = route.title;
    data.title = store.dispatch(getMessage(route.title));

    if (route.redirect) {
      res.redirect(route.status || 302, route.redirect);
      return;
    }

    if (!['/login', '/registration', '/help', '/activateUser'].some((path) => req.path.startsWith(path))) {
      if (!req.userInfo) {
        res.redirect('/login');
        return;
      }
      context.me = await store.dispatch(fetchCurrentUser());
    }
    if (route.fetchData) {
      await route.fetchData({query: req.query, context, routeArgs: route.routeArgs});
    }

    css = new Set();
    statusCode = 200;


    // Fire all componentWill... hooks
    data.children = ReactDOM.renderToString(
      <App
        context={context}
        showLayout={route.showLayout}
        showGoBackBtn={route.showGoBackBtn}
      >
        {route.component}
      </App>
    );

    data.state = store.getState();

    data.style = [...css].join('');

    if (!sent) {
      const html = ReactDOM.renderToStaticMarkup(<Html {...data} />);
      res.status(statusCode);
      res.send(`<!doctype html>${html}`);
    }
  } catch (err) {
    next(err);
  } finally {
    removeHistoryListener();
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  logError('Catch resolve error', err);
  if (err.redirect) {
    return res.redirect(err.redirect);
  }
  console.log(pe.render(err)); // eslint-disable-line no-console
  const locale = req.language;
  const statusCode = err.status || 500;
  const html = ReactDOM.renderToStaticMarkup(
    <Html
      title="Internal Server Error"
      description={err.message}
      style={errorPageStyle._getCss()} // eslint-disable-line no-underscore-dangle
    >
    {ReactDOM.renderToString(
      <IntlProvider locale={locale}>
        <ErrorPageWithoutStyle error={err}/>
      </IntlProvider>
    )}
    </Html>
  );
  res.status(statusCode);
  res.send(`<!doctype html>${html}`);
});
