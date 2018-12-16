import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLNonNull
} from 'graphql';
import UsersService from '../services/users';
import FileType from '../types/FileType';
import FilesService from '../services/files';

const UserType = new GraphQLObjectType({
  name: 'User',
  service: UsersService,
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      filter: true
    },
    firstName: {
      type: new GraphQLNonNull(GraphQLString),
      filter: true,
      sort: true,
      textSearch: true
    },
    lastName: {
      type: new GraphQLNonNull(GraphQLString),
      filter: true,
      sort: true,
      textSearch: true
    },
    middleName: {
      type: new GraphQLNonNull(GraphQLString),
      filter: true,
      sort: true
    },
    login: {
      type: new GraphQLNonNull(GraphQLString),
      filter: true,
      sort: true,
      textSearch: true,
      setOn: ['create']
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      getOn: []
    },
    photo: {
      type: FileType,
      foreign: true,
      resolve: (parent) => {
        let service = new FilesService();
        return service.get({id: parent.photo});
      }
    }
  }
});

export default UserType;
