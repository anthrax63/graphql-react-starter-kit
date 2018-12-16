/* eslint-disable react/display-name */
import React, {PropTypes} from 'react';
import createListComponent from '../CommonList';
import UserEditor from '../UserEditor';
import {defineMessages} from 'react-intl';
import Avatar from 'material-ui/Avatar';


const messages = defineMessages({
  columnEmail: {
    id: 'usersList.columnEmail',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  columnPhoto: {
    id: 'usersList.columnPhoto',
    defaultMessage: 'Photo',
    description: 'Photo'
  },
  columnFirstName: {
    id: 'usersList.columnFirstName',
    defaultMessage: 'First Name',
    description: 'First Name'
  },
  columnLastName: {
    id: 'usersList.columnLastName',
    defaultMessage: 'Last Name',
    description: 'Last Name'
  },
  filterLabelEmail: {
    id: 'usersList.filterLabelEmail',
    defaultMessage: 'E-mail',
    description: 'E-mail'
  },
  filterLabelFirstName: {
    id: 'usersList.filterLabelFirstName',
    defaultMessage: 'First Name',
    description: 'First Name'
  },
  filterLabelLastName: {
    id: 'usersList.filterLabelLastName',
    defaultMessage: 'Last Name',
    description: 'Last Name'
  }
});

const shape = PropTypes.shape({
  login: PropTypes.string,
  firstName: PropTypes.string,
  lastName: PropTypes.string
});


export default createListComponent({
  name: 'UsersList',
  shape,
  columns: (props) => [
    {
      name: 'login',
      label: messages.columnEmail
    },
    {
      cellText: (item) => {
        if (item.photo && item.photo.ready) {
          return <Avatar
            src={item.photo.link}
            size={30}
          />;
        } else {
          return '-';
        }
      },
      label: messages.columnPhoto
    },
    {
      name: 'firstName',
      label: messages.columnFirstName
    },
    {
      name: 'lastName',
      label: messages.columnLastName
    }
  ],
  editorComponent: UserEditor,
  filterFields: (props) => {
    return [
      {
        name: 'login',
        label: messages.filterLabelEmail,
        condition: 'contains'
      },
      {
        name: 'firstName',
        label: messages.filterLabelFirstName,
        condition: 'contains'
      },
      {
        name: 'lastName',
        label: messages.filterLabelLastName,
        condition: 'contains'
      }
    ];
  }
});
