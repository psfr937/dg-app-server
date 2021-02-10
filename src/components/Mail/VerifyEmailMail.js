import React from 'react';
import propTypes from 'prop-types'
import tokenToURL from '../../utils/tokenToURL';

const Email = require('./MailTemplate/Email').default;

const VerifyEmailMail = ({ token }) => {
  const url = tokenToURL('/user/email/verify', token);

  const content =  (
    <div>
      <p>
        Please click the following link to verify your account.
      </p>
      <p>
        <a href={url}>
          {url}
        </a>
      </p>
    </div>
  );

  return Email(content);
};

VerifyEmailMail.propTypes = {
  token: propTypes.string,
};

export default VerifyEmailMail;
