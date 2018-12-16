import {AuthorizationError} from '../constants/errors';

export function handleError(response, {history}) {
  if (response.errors) {
    for (let i = 0; i < response.errors.length; i++) {
      let error = response.errors[i];
      if (error.code === AuthorizationError.code) {
        let location = history.location;
        let currentUrl = `${location.pathname || ''}${location.search || ''}` || '/';
        let newUrl = `/login?redirectUrl=${currentUrl}`;
        history.push(newUrl);
        let redirectError = new AuthorizationError(error.data);
        redirectError.redirect = newUrl;
        throw redirectError;
      }
    }
  }
}
