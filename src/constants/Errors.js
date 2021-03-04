import ErrorCodes from './ErrorCodes';

export default {
  [ErrorCodes.BAD_REQUEST]: {
    code: ErrorCodes.BAD_REQUEST,
    status: 500,
    title: 'Bad Request',
    detail: 'Invalid Parameter'
  },
  [ErrorCodes.UNKNOWN_EXCEPTION]: {
    code: ErrorCodes.UNKNOWN_EXCEPTION,
    status: 500,
    title: 'Unknown Exception',
    detail: 'Something wrong happened.'
  },
  [ErrorCodes.GOGOVAN_API_ERROR]: detail => {
    return {
      code: ErrorCodes.UNKNOWN_EXCEPTION,
      status: 500,
      title: 'Unknown Exception',
      detail
    }
  },
  [ErrorCodes.GOOGLE_MAP_ERROR]: detail => {
    return {
      code: ErrorCodes.UNKNOWN_EXCEPTION,
      status: 500,
      title: 'Unknown Exception',
      detail
    }
  },
  [ErrorCodes.SERVER_EXCEPTION]: detail => {
    return {
      code: ErrorCodes.SERVER_EXCEPTION,
      status: 500,
      title: 'Unknown Exception',
      detail
    }
  },
  [ErrorCodes.PAYMENT_ERROR]: detail => {
    return {
      code: ErrorCodes.PAYMENT_ERROR,
      status: 500,
      title: 'Database Operation Failed',
      detail
    }
  },
  [ErrorCodes.DB_OPERATION_FAIL]: detail => {
    return {
      code: ErrorCodes.DB_OPERATION_FAIL,
      status: 500,
      title: 'Database Operation Failed',
      detail
    }
  },
  [ErrorCodes.DB_VALIDATION]: {
    code: ErrorCodes.DB_VALIDATION,
    status: 400,
    title: 'Database Validation Failed',
    detail: 'The data is invalid.'
  },
  [ErrorCodes.INVALID_RECAPTCHA]: {
    code: ErrorCodes.INVALID_RECAPTCHA,
    status: 400,
    title: 'Invalid Recaptcha',
    detail: 'The value of recaptcha is invalid.'
  },
  [ErrorCodes.INVALID_DATA]: {
    code: ErrorCodes.INVALID_DATA,
    status: 400,
    title: 'Invalid Data',
    detail: 'You are sending invalid data.'
  },
  [ErrorCodes.STATE_PRE_FETCHING_FAIL]: {
    code: ErrorCodes.STATE_PRE_FETCHING_FAIL,
    status: 500,
    title: 'Server-Side State Fetching Failed',
    detail: 'Fail to pre-fetch state on server side.'
  },
  [ErrorCodes.USER_UNAUTHORIZED]: {
    code: ErrorCodes.USER_UNAUTHORIZED,
    status: 401,
    title: 'User Unauthorized',
    detail:
      'You are a guest or invalid user. Please login to access the resource.'
  },
  [ErrorCodes.GET_SMS_VERIFY_CODE]: detail => {
    return {
      code: ErrorCodes.GET_SMS_VERIFY_CODE,
      status: 401,
      title: 'Get Sms verify code',
      detail
    }
  },
  [ErrorCodes.CHECK_SMS_VERIFY_CODE]: detail => {
    return {
      code: ErrorCodes.CHECK_SMS_VERIFY_CODE,
      status: 401,
      title: 'Check Sms verify code',
      detail
    }
  },
  [ErrorCodes.NOT_FOUND]: {
    code: ErrorCodes.NOT_FOUND,
    status: 404,
    title: 'Not found',
    detail:
      'Resource not found.'
  },
  [ErrorCodes.USER_EXISTED]: {
    code: ErrorCodes.USER_EXISTED,
    status: 400,
    title: 'User Existed',
    detail: 'This user is already registered.'
  },
  [ErrorCodes.TOKEN_REUSED]: {
    code: ErrorCodes.TOKEN_REUSED,
    status: 400,
    title: 'Token Reused',
    detail: 'The token is reused.'
  },
  [ErrorCodes.BAD_TOKEN]: {
    code: ErrorCodes.BAD_TOKEN,
    status: 400,
    title: 'Bad Token',
    detail: 'Fail to decode the token.'
  },
  [ErrorCodes.TOKEN_EXPIRATION]: {
    code: ErrorCodes.TOKEN_EXPIRATION,
    status: 401,
    title: 'Token Expired',
    detail: 'Your token has expired.'
  },
  [ErrorCodes.PERMISSION_DENIED]: {
    code: ErrorCodes.PERMISSION_DENIED,
    status: 403,
    title: 'Permission Denied',
    detail: 'You are not allowed to access the resource.'
  },
  [ErrorCodes.LOCALE_NOT_SUPPORTED]: {
    code: ErrorCodes.LOCALE_NOT_SUPPORTED,
    status: 400,
    title: 'Locale not supported',
    detail: "We don't support this locale."
  },
  [ErrorCodes.LOGIN_FAIL]: {
    code: ErrorCodes.LOGIN_FAIL,
    status: 400,
    title: 'Authorization Failed',
    detail: 'Wrong username or password.'
  },
  [ErrorCodes.AUTHORIZATION_FAIL]: {
    code: ErrorCodes.AUTHORIZATION_FAIL,
    status: 400,
    title: 'Authorization Failed',
    detail: 'Please make sure you authorize all required information to us.'
  },
  [ErrorCodes.SEND_EMAIL_FAIL]: {
    code: ErrorCodes.SEND_EMAIL_FAIL,
    status: 500,
    title: 'Email Not Sent',
    detail: "Mail service didn't send the mail correctly."
  }
};
