import React from 'react';
import Link from '../Link';
import {defineMessages, injectIntl, intlShape} from 'react-intl';

const messages = defineMessages({
  linkText: {
    id: 'helpLinkText.linkText',
    defaultMessage: 'Help',
    description: 'Help link text'
  }
});

function HelpLinkText(props) {
  const {intl: {formatMessage}} = props;
  return (
    <Link to='/help' simpleHref={true} newTab={true}>{formatMessage(messages.linkText)}</Link>
  );
}

HelpLinkText.propTypes = {
  intl: intlShape
};

export default injectIntl(HelpLinkText);
