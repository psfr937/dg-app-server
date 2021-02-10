import ErrorTypes from '../constants/ErrorCodes';
import Errors from '../constants/Errors';

const getErrorHandler = errorTypes => res => fn => (err, ...result) => {
  if (err) {
    if (!Array.isArray(errorTypes)) {
      errorTypes = [errorTypes];
    }
    errorTypes.forEach(errorType => {
      switch (errorType) {
        case ErrorTypes.ODM_OPERATION: {
          if (err.name === 'ValidationError') {
            res.pushError(Errors.ODM_VALIDATION, err);
            break;
          }
          if (err.name === 'MongooseError') {
            res.pushError(Errors.ODM_OPERATION_FAIL, err);
            break;
          }
          break;
        }
        case ErrorTypes.JSON_WEB_TOKEN: {
          // ref:
          //   - <https://github.com/auth0/node-jsonwebtoken#errors--codes>
          if (err.name === 'JsonWebTokenError') {
            res.pushError(Errors.BAD_TOKEN, err);
            break;
          } else if (err.name === 'TokenExpiredError') {
            res.pushError(Errors.TOKEN_EXPIRATION, err);
            break;
          }
          break;
        }
        case ErrorTypes.PASSPORT: {
          if (err.message === 'No auth token') {
            res.pushError(Errors.USER_UNAUTHORIZED, err);
            break;
          }
          break;
        }
        default: {
          res.pushError(Errors.UNKNOWN_EXCEPTION, err);
          break;
        }
      }
      return res.errors();
    });
  }
  return fn(...result);
};

const handleError = getErrorHandler(null);
const handleDbError = getErrorHandler(ErrorTypes.ODM_OPERATION);
const handleJwtError = getErrorHandler(ErrorTypes.JSON_WEB_TOKEN);
const handlePassportError = getErrorHandler([
  ErrorTypes.JSON_WEB_TOKEN,
  ErrorTypes.PASSPORT
]);

export { handleDbError, handleJwtError, handlePassportError };
export default handleError;
