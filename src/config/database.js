const getDatabaseConfig = (environment) => {
  const configs = {
    'development': {
      db: {
        user: process.env.DEV_DB_USER,
        password: process.env.DEV_DB_USER_PASS,
        host: process.env.DEV_DB_HOST,
        port: process.env.DEV_DB_PORT,
        database: process.env.DEV_DB_DATABASE,
        url: process.env.DATABASE_URL
      }
    },
    'production': {
      db: {
        user: process.env.PROD_DB_USER,
        password: process.env.PROD_DB_USER_PASS,
        host: process.env.PROD_DB_HOST,
        port: process.env.PROD_DB_PORT,
        database: process.env.PROD_DB_DATABASE,
        url: process.env.DATABASE_URL
      }
    }
  };

  return configs[environment];
};

export default getDatabaseConfig;
