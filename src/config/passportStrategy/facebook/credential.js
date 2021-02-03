module.exports = {
  development: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `http://${process.env.DEV_HOST}:${process.env.DEV_PORT}/api/auth/facebook/callback`
  },
  production: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: `https://${process.env.PROD_DOMAIN_NAME}/api/auth/facebook/callback`
  }
};
