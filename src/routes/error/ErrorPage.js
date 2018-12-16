import React, {PropTypes} from 'react';
import {intlShape, defineMessages, injectIntl} from 'react-intl';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ErrorPage.css';

const messages = defineMessages({
  title: {
    id: 'errorPage.title',
    defaultMessage: 'Error',
    description: 'Error page title'
  },
  content: {
    id: 'errorPage.content',
    defaultMessage: 'Sorry, a critical error occurred on this page. We are working hard to fix it.',
    description: 'Error page content'
  },
  titlePageNotFound: {
    id: 'errorPage.titlePageNotFound',
    defaultMessage: 'Page not found',
    description: 'Error page title if page not found'
  },
  contentPageNotFound: {
    id: 'errorPage.contentPageNotFound',
    defaultMessage: 'Sorry, the page you were trying to view does not exist.',
    description: 'Error page content if page not found'
  }
});

function ErrorPage({error, intl}, context) {
  const {formatMessage} = intl;
  let title = formatMessage(messages.title);
  let content = formatMessage(messages.content);
  let errorMessage = null;

  if (error.status === 404) {
    title = formatMessage(messages.titlePageNotFound);
    content = formatMessage(messages.contentPageNotFound);
  } else if (process.env.NODE_ENV !== 'production') {
    errorMessage = <pre>{error.stack}</pre>;
  }

  return (
    <div>
      <h1>{title}</h1>
      <p>{content}</p>
      {errorMessage}
    </div>
  );
}

ErrorPage.propTypes = {error: PropTypes.object.isRequired, intl: intlShape.isRequired};

export const ErrorPageWithoutStyle = injectIntl(ErrorPage);
export default injectIntl(withStyles(s)(ErrorPage));
