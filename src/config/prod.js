const merge = require('lodash/fp/merge');

const defaultConfig = require('./default');

module.exports =merge(defaultConfig,{
  listenTo: process.env.PROD_LISTEN_TO,
  host: process.env.PROD_HOST, // Define your host from 'package.json'
  port: process.env.PROD_PORT,
  backdoor: false,
  passportStrategy: {
    facebook: require('./passportStrategy/facebook/credential').production,
    google: require('./passportStrategy/google/credential').production,
  },
  stripe: process.env.STRIPE_PRODUCTION,
  nodemailer:{
    service: 'gmail',
    auth: {
      user: 'your_gmail_username',
      pass: 'your_gmail_password',
    },
  }
});
