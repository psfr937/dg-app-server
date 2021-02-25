// Update with your config settings.

require('dotenv').config({path: '.env'});

const pg = require('pg')
// pg.defaults.ssl = {
//   rejectUnauthorized: false,
// }

module.exports = {

  development: {
    client: 'pg',
    connection: process.env.DEV_DATABASE_URL,
    ssl: false,
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  test: {
    client: 'pg',
    connection: process.env.DEV_DATABASE_URL,
    ssl: false,
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    },
    pool: {
      min: 2,
      max: 10
    },
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    },
    pool: {
      min: 2,
      max: 10
    },
  }

};
