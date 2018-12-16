import {
  createSaveAction,
  createQueryAction,
  createRemoveAction,
  createGetAction
} from '../../helpers/actionBuilders';

const actionPrefix = 'USERS_LIST';


export const ActionTypes = {
  editor: {
    add: `${actionPrefix}_EDITOR_ADD`,
    cancel: `${actionPrefix}_EDITOR_CANCEL`,
    edit: {
      start: `${actionPrefix}_EDITOR_GET_START`,
      success: `${actionPrefix}_EDITOR_GET_SUCCESS`,
      error: `${actionPrefix}_EDITOR_GET_ERROR`
    },
    save: {
      start: `${actionPrefix}_EDITOR_SAVE_START`,
      success: `${actionPrefix}_EDITOR_SAVE_SUCCESS`,
      error: `${actionPrefix}_EDITOR_SAVE_ERROR`
    },
    clear: {},
    search: {}
  },
  updateQuery: `${actionPrefix}_UPDATE_QUERY`,
  fetch: {
    updateQuery: `${actionPrefix}_FETCH_UPDATE_QUERY`,
    start: `${actionPrefix}_FETCH_START`,
    success: `${actionPrefix}_FETCH_SUCCESS`,
    error: `${actionPrefix}_FETCH_ERROR`
  },
  remove: {
    start: `${actionPrefix}_REMOVE_START`,
    success: `${actionPrefix}_REMOVE_SUCCESS`,
    error: `${actionPrefix}_REMOVE_ERROR`
  }
};

export const fetch = createQueryAction(
  'User',
  ActionTypes.fetch,
  [
    'id',
    'login',
    'firstName',
    'lastName',
    {photo: ['link', 'ready']}
  ]
);

export const save = createSaveAction(
  'User',
  ActionTypes.editor.save,
  {
    login: 'String!',
    password: 'String!',
    firstName: 'String!',
    lastName: 'String!',
    middleName: 'String!',
    photoId: 'ID'
  },
  [
    'id'
  ],
  false
);

export const remove = createRemoveAction(
  'User',
  ActionTypes.remove
);


export const editorAdd = () => {
  return (dispatch) => {
    dispatch({type: ActionTypes.editor.add});
  };
};

export const editorCancel = () => {
  return (dispatch) => {
    dispatch({type: ActionTypes.editor.cancel});
  };
};

export const editorEdit = createGetAction(
  'User',
  ActionTypes.editor.edit,
  [
    'id',
    'login',
    'firstName',
    'lastName',
    'middleName',
    {photo: ['id', 'name', 'link', 'ready']}
  ]
);
