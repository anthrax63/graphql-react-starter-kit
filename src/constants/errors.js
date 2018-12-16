import {defineMessages} from 'react-intl';

export const messages = defineMessages({
  unknownError: {
    id: 'errors.unknownError',
    defaultMessage: 'An unknown error has occurred',
    description: 'An unknown error has occurred'
  },
  internalServerError: {
    id: 'errors.internalServerError',
    defaultMessage: 'Internal server error',
    description: 'Internal server error'
  },
  validationError: {
    id: 'errors.validationError',
    defaultMessage: 'Validation error',
    description: 'Validation error'
  },
  notEnoughBalance: {
    id: 'errors.notEnoughBalance',
    defaultMessage: 'Not enough balance',
    description: 'Not enough balance'
  },
  notFoundError: {
    id: 'errors.notFoundError',
    defaultMessage: 'Requested item not found',
    description: 'Not found error'
  },
  accessViolationError: {
    id: 'errors.accessViolationError',
    defaultMessage: 'Access violation',
    description: 'Access violation error'
  },
  authorizationError: {
    id: 'errors.authorizationError',
    defaultMessage: 'Authorization error',
    description: 'Authorization error'
  },
  invalidLoginOrPasswordError: {
    id: 'errors.invalidLoginOrPasswordError',
    defaultMessage: 'Invalid login or password',
    description: 'Invalid login or password'
  },
  userAlreadyExists: {
    id: 'errors.userAlreadyExists',
    defaultMessage: 'User already exists',
    description: 'User already exists'
  }
});

export class QueryError extends Error {
  constructor(code, intlMessage, data) {
    super(intlMessage.defaultMessage);
    this.messageId = intlMessage.id;
    this.code = code;
    this.data = data;
  }
}

export class InternalServerError extends QueryError {
  static code = 'SE001';

  constructor(err) {
    super(InternalServerError.code, messages.internalServerError, {
      message: err.message,
      stack: err.stack
    });
  }
}

export class CommonValidationError extends QueryError {
  static code = 'VL001';

  constructor(data) {
    super(CommonValidationError.code, messages.validationError, data);
  }
}

export class UserAlreadyExistsError extends QueryError {
  static code = 'VL004';

  constructor(data) {
    super(UserAlreadyExistsError.code, messages.userAlreadyExists, data);
  }
}

export class NotFoundError extends QueryError {
  static code = 'NF001';

  constructor(data) {
    super(NotFoundError.code, messages.notFoundError, data);
  }
}


export class AuthorizationError extends QueryError {
  static code = 'AT001';

  constructor(data) {
    super(AuthorizationError.code, messages.authorizationError, data);
  }
}

export class InvalidLoginOrPasswordError extends QueryError {
  static code = 'AT002';

  constructor() {
    super(InvalidLoginOrPasswordError.code, messages.invalidLoginOrPasswordError);
  }
}


export class AccessViolationError extends QueryError {
  static code = 'AV001';

  constructor(data) {
    super(AccessViolationError.code, messages.accessViolationError, data);
  }
}


