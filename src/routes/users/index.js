import React from 'react';
import UsersListContainer, {fetchData} from '../../containers/UsersListContainer';
import {defineMessages} from 'react-intl';

const messages = defineMessages({
  title: {
    id: 'routes.users.title',
    defaultMessage: 'Users',
    description: 'Users title'
  }
});

const path = '/users';

export default {

  path,

  async action() {
    return {component: <UsersListContainer />, fetchData, showLayout: true, title: messages.title};
  }

};
