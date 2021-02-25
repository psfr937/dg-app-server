const getDatabaseConfig = (environment) => {
  const configs = {
    'development': {
      db: {
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_USER_PASS,
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        database: process.env.DEV_DB_DATABASE,
        ssl: false
      }
    },
    'test': {
      db: {
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_USER_PASS,
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        database: process.env.DEV_DB_DATABASE,
        ssl: false
      }
    }
  };

  return configs[environment].db;
};

export default getDatabaseConfig;
