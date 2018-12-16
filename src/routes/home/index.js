import React from 'react';
import Home from '../../containers/Home';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'routes.home.title',
    defaultMessage: 'Home',
    description: 'Home title'
  }
});

const path = '/';

export default {

  path,

  async action() {
    return {
      component: <Home />,
      title: messages.title
    };
  }

};
