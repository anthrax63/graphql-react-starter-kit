import {
  createSaveAction,
  createQueryAction,
  createRemoveAction,
  createGetAction,
  createSearchAction
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
    search: {
      schools: {
        start: `${actionPrefix}_EDITOR_SEARCH_SCHOOLS_START`,
        success: `${actionPrefix}_EDITOR_SEARCH_SCHOOLS_SUCCESS`,
        error: `${actionPrefix}_EDITOR_SEARCH_SCHOOLS_ERROR`
      },
      localities: {
        start: `${actionPrefix}_EDITOR_SEARCH_LOCALITIES_START`,
        success: `${actionPrefix}_EDITOR_SEARCH_LOCALITIES_SUCCESS`,
        error: `${actionPrefix}_EDITOR_SEARCH_LOCALITIES_ERROR`
      },
      publishers: {
        start: `${actionPrefix}_EDITOR_SEARCH_PUBLISHERS_START`,
        success: `${actionPrefix}_EDITOR_SEARCH_PUBLISHERS_SUCCESS`,
        error: `${actionPrefix}_EDITOR_SEARCH_PUBLISHERS_ERROR`
      },
      regions: {
        start: `${actionPrefix}_EDITOR_SEARCH_REGIONS_START`,
        success: `${actionPrefix}_EDITOR_SEARCH_REGIONS_SUCCESS`,
        error: `${actionPrefix}_EDITOR_SEARCH_REGIONS_ERROR`
      }
    },
    clear: {
      schools: `${actionPrefix}_CLEAR_SCHOOLS`,
      publishers: `${actionPrefix}_CLEAR_PUBLISHERS`,
      regions: `${actionPrefix}_CLEAR_REGIONS`
    }
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
    'schoolApproved',
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
    photoId: 'ID',
    accessRoles: '[String]',
    schoolId: 'ID',
    publisherId: 'ID',
    regionId: 'ID',
    grade: 'String',
    position: 'String',
    activated: 'Boolean!',
    schoolApproved: 'Boolean!'
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
    {photo: ['id', 'name', 'link', 'ready']},
    'type',
    'accessRoles',
    'grade',
    'position',
    {school: ['id', 'name', {locality: ['id', 'name', {region: ['name']}]}]},
    {publisher: ['id', 'name', 'description', 'adress', 'phone', 'support']},
    {region: ['name']},
    'mosregId',
    'type',
    'activated',
    'schoolApproved'
  ]
);

export const searchSchoolsByLocality = createSearchAction(
  'School',
  ActionTypes.editor.search.schools,
  [
    'id',
    'name',
    {locality: ['id', 'name', {region: ['name']}]}
  ]
);


export const searchLocalities = createSearchAction(
  'Locality',
  ActionTypes.editor.search.localities,
  [
    'id',
    'name',
    {region: ['name']}
  ]
);

export const clearFoundSchools = () => {
  return (dispatch) => {
    dispatch({type: ActionTypes.editor.clear.schools});
  };
};

export const searchPublisher = createSearchAction(
  'Publisher',
  ActionTypes.editor.search.publishers,
  [
    'id',
    'name'
  ]
);

export const clearFoundPublishers = () => {
  return (dispatch) => {
    dispatch({type: ActionTypes.editor.clear.publishers});
  };
};

export const searchRegions = createSearchAction(
  'Region',
  ActionTypes.editor.search.regions,
  ['id', 'name']
);

export const clearFoundRegions = () => {
  return (dispatch) => {
    dispatch({type: ActionTypes.editor.clear.regions});
  };
};
