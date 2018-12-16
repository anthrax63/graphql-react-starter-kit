import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInt
} from 'graphql';
import FilesService from '../services/files';

const FileType = new GraphQLObjectType({
  name: 'File',
  service: FilesService,
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      filter: true,
      sort: false
    },
    name: {
      type: GraphQLString,
      filter: true,
      sort: true,
      textSearch: true,
      setOn: []
    },
    ready: {
      type: new GraphQLNonNull(GraphQLBoolean),
      filter: true,
      sort: true,
      setOn: []
    },
    size: {
      type: GraphQLInt,
      filter: true,
      sort: true,
      setOn: []
    },
    readySize: {
      type: GraphQLInt,
      setOn: [],
      sort: true
    },
    link: {
      type: GraphQLString,
      setOn: []
    }
  }
});

export default FileType;
