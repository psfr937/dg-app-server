export default (baseURL, token, domainName = '') =>
  process.env.NODE_ENV !== 'development' ?
    `https://${domainName}${baseURL}?token=${token}`
    : `http://${process.env.DEV_HOST}:${process.env.DEV_PORT}${baseURL}?token=${token}`;

