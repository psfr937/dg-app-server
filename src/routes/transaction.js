import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import setupPaymentController from"../controllers/billing/setupPayment"
import checkStripeCustomer from "../controllers/billing/checkStripeCustomer";
import subscribeController from "../controllers/billing/subscribe";
import transaction from '../controllers/transaction'
export default app => {


  app.post('/api/transaction/buy',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    transaction.buy
  );

  app.post('/api/transaction/sell',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    transaction.sell
  );

  app.post('/api/transaction/add-payment-method',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    subscribeController.subscribe
  );


  app.post('/api/transaction/set-default-method',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.setDefaultPaymentMethod
  );

  app.post('/api/transaction/subscribe',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    subscribeController.subscribe
  );
};
