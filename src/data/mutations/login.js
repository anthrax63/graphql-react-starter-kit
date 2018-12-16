import TokenType from '../types/TokenType';
import {GraphQLString, GraphQLNonNull} from 'graphql';
import UserService from '../services/users';
import {createToken} from '../../core/auth';
import {InvalidLoginOrPasswordError} from '../../constants/errors';

export default {
  login: {
    type: TokenType,
    args: {
      login: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(parent, args) {
      let service = new UserService();
      let loginResult = await service.tryLogin(args);
      if (!loginResult) {
        throw new InvalidLoginOrPasswordError();
      }
      let {_id: id, login} = loginResult;
      let token = createToken({id: id.toString(), login});
      return {
        result: true,
        ...token
      };
    }
  }
};
