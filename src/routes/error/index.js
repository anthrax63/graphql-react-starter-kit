import React from 'react';
import ErrorPage from './ErrorPage';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'routes.error.title',
    defaultMessage: 'Error',
    description: 'Error page title'
  }
});

export default {

  path: '/error',

  action({render, context, error}) {
    return {
      showLayout: false,
      component: <ErrorPage error={error} />,
      title: messages.title
    };
  }

};
