import React from 'react';
import LoginContainer from '../../containers/LoginContainer';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'routes.login.title',
    defaultMessage: 'Login',
    description: 'Login title'
  }
});

export default {

  path: '/login',

  action() {
    return {
      showLayout: false,
      component: <LoginContainer />,
      title: messages.title
    };
  }

};
