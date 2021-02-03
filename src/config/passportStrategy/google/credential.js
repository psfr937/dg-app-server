module.exports = {
  development: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://${process.env.DEV_HOST}:${process.env.DEV_PORT}/api/auth/google/callback`
  },
  production: {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:`https://${process.env.PROD_DOMAIN_NAME}/api/auth/google/callback`

  }
};
