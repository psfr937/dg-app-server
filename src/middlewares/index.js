import mountStore from "./mountStore";
import errorHandler from "./errorHandler";
import passportInit from './passportInit';
import cors from 'cors'
var path = require('path');

export default app => {

  app.use('*', cors({
    "origin": process.env.NODE_ENV === 'development' ?
      "http://localhost:3000" : "https://dressgreen.net",
    "credentials": true
  }));

  app.use(mountStore);
  app.use(errorHandler);
  app.use(passportInit);

  const swaggerUi = require('swagger-ui-express');
  const YAML = require('yamljs');
  var swagger_path =  path.resolve(__dirname,'./swagger.yaml');
  const swaggerDocument = YAML.load(swagger_path);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};
//{
//  quotationId: INTEGER,
//  itemsList: {
//    items: [
//      id: INTEGER,
//      price: INTEGER
//    ],
//    timestamp: INTEGER
//  },
//  paymentMethod: {
//    savePaymentMethod: BOOLEAN,
//    detail (optional): {
//      stripeId: STRING
//      lastFour: STRING,
//      expiry_year: NUMBER,
//      expiry_month: NUMBER,
//      funding: STRING
//    },
//    id (optional / dbId): INTEGER
//  }
//}