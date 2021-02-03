// Update with your config settings.

require('dotenv').config({path: '.env'});

const pg = require('pg')
pg.defaults.ssl = {
  rejectUnauthorized: false,
}

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host: process.env.DEV_DB_HOST,
      database: process.env.DEV_DB_DATABASE,
      user:     process.env.DEV_DB_USER,
      password:  process.env.DEV_DB_USER_PASS,
      charset: 'utf8'
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
  },

  staging: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
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
