import {ActionTypes} from './actions';

export default function(state = {values: [], query: {limit: 10, skip: 0}, totalCount: 0},
                         action) {
  const {type, payload} = action;
  switch (type) {
    case ActionTypes.fetch.updateQuery:
      return {
        ...state,
        query: payload
      };
    case ActionTypes.fetch.success:
      return {
        ...state,
        values: payload.values,
        totalCount: payload.totalCount,
        filterData: payload.filterData
      };
    case ActionTypes.remove.success:
      return {
        ...state
      };
    case ActionTypes.editor.add:
      return {
        ...state,
        editItem: {}
      };
    case ActionTypes.editor.cancel:
      return {
        ...state,
        editItem: null
      };
    case ActionTypes.editor.edit.success:
      return {
        ...state,
        editItem: payload
      };
    case ActionTypes.editor.save.success:
      return {
        ...state,
        editItem: null
      };
    case ActionTypes.editor.search.schools.success:
      return {
        ...state,
        foundSchools: payload
      };
    case ActionTypes.editor.search.localities.success:
      return {
        ...state,
        foundLocalities: payload
      };
    case ActionTypes.editor.clear.schools:
      return {
        ...state,
        foundSchools: null
      };
    case ActionTypes.editor.search.publishers.success:
      return {
        ...state,
        foundPublishers: payload
      };
    case ActionTypes.editor.clear.publishers:
      return {
        ...state,
        foundPublishers: null
      };
    case ActionTypes.editor.search.regions.success:
      return {
        ...state,
        foundRegions: payload
      };
    case ActionTypes.editor.clear.regions:
      return {
        ...state,
        foundRegions: null
      };
  }
  return state;
}
