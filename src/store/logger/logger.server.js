import {inspect} from 'util';
import log from '../../helpers/log';

// Server side redux action logger
export default function createLogger() {
  return (store) => (next) => (action) => { // eslint-disable-line no-unused-vars
    const formattedPayload = inspect(action.payload, {
      colors: true
    });
    log.debug(` * ${action.type}: ${formattedPayload}`); // eslint-disable-line no-console
    return next(action);
  };
}
