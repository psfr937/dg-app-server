import isString from 'lodash/isString';

/**
 * @returns {boolean} isPassed
 */

export const validation = (formPath) => (body, files) => {
  switch(formPath){
    case 'user/RegistrationForm':
      return (body, files) => [];
      break;
    default:
      return (body, files) => [];
      break;
  }
};

export const validateErrorObject = nestedErrors => {
  if (isString(nestedErrors)) {
    return false;
  }
  const keys = Object.keys(nestedErrors);
  if (keys.length === 0) {
    return true;
  }
  const isAllPass = keys.every(key => {
    const nestedError = nestedErrors[key];
    const isPass = validateErrorObject(nestedError);
    return isPass;
  });
  return isAllPass;
};


