import getDatabaseConfig from '../config/database';
import logger from "./logger";

const { Pool } = require('pg');
const url = require('url')


let databaseConfig = {}



if(typeof process.env.DATABASE_URL === 'string'){
  const params = url.parse(process.env.DATABASE_URL)
  const auth = params.auth.split(':');
  databaseConfig = {
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: {
      rejectUnauthorized: false
    }
  };
}else{
  databaseConfig = getDatabaseConfig(process.env.NODE_ENV)
}


class Agent {

  constructor(config) {
    this.pool = new Pool(config);
  }


  query(text, params){
    console.log('Attempt to execute query', {text, params} )
    const start = Date.now();
    return new Promise((resolve, reject) => {
      this.pool.query(text, params, (err, res) => {
        const duration = Date.now() - start;
        console.log('executed query', {
          text, duration,
        })
        if (err) {
          logger.error(err, '%o')
          reject(err);
        }
        else{
          resolve(res);
        }
      });
    })
  }

  async tx(callback){
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      try {
        await callback(client)
        client.query('COMMIT')
      } catch(e) {
        client.query('ROLLBACK')
        throw e
      }
    } finally {
      client.release()
    }
  }


  async transaction(queries){
    const client = await this.pool.connect()
    let results = []
    try {
      await client.query('BEGIN')
      for(let i = 0; i < queries.length; i++){
        const q = queries[i]
        const { query, values } = q
        const result = await client.query(query, values)
        results.push(result)
      }
      await client.query('COMMIT')

    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      await client.release()
    }
    return results
  }



  getClient(callback){
    this.pool.connect((err, client, done) => {
      const query = client.query.bind(client);

      // monkey patch the query method to keep track of the last query executed
      client.query = (args) => {
        client.lastQuery = args;
        client.query(...args)
      };

      // set a timeout of 5 seconds, after which we will log this client's last query
      const timeout = setTimeout(() => {
        console.error('A client has been checked out for more than 5 seconds!')
        console.error(`The last executed query on this client was: ${client.lastQuery}`)
      }, 5000);

      const release = error => {
        // call the actual 'done' method, returning this client to the pool
        done(error);

        // clear our timeout
        clearTimeout(timeout);

        // set the query method back to its old un-monkey-patched version
        client.query = query
      };

      callback(err, client, done)
    })
  }
}

export default new Agent(databaseConfig);



