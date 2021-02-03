
import  p from './agents';

const knexLib = require('knex');
const knexnest = require('knexnest');

const knex = knexLib({
  client: 'postgres',
  connection: process.env.DATABASE_URL
});


const qNonEmpty = async (sql, params, loglevel = 'info', errMetaData) => {

  return await p.query(sql, params, loglevel)
    .then(res => {
      if (res.rows.length === 0) {
       // console.log(errMetaData);
        throw new Error('No rows found');
      }
      return res;
    })
    .catch(err => {
      console.log(err)
      throw err;
    })
};

const q = async (sql, params, loglevel = 'info') => {

  return await p.query(sql, params, loglevel)
    .then(res => {
      return res;
    })
    .catch(err => {
      throw err;
    })
};




const handleCustomActionError = (
  {
    action = UTTER_INTERNAL_SERVER_ERROR,
    message = ''
  }
  ) => {
    logger.error(message);
    return {
      reply: {
        action
      }
    };
  };


module.exports = {
  knex,
  knexnest,
  q,
  qNonEmpty,
  handleCustomActionError
}
