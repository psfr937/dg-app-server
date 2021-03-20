const merge = require('lodash/fp/merge');

const defaultConfig = require('./default');

module.exports =merge(defaultConfig,{
  backdoor: false,
  passportStrategy: {
    facebook: require('./passportStrategy/facebook/credential').production,
    google: require('./passportStrategy/google/credential').production,
  },
});
