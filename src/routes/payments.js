import paymentController from "../controllers/billing/pay"
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import setupPaymentController from"../controllers/billing/setupPayment"
import checkStripeCustomer from "../controllers/billing/checkStripeCustomer";
import subscribeController from "../controllers/billing/subscribe";

export default app => {
  app.post('/api/payment/create-payment-intent',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    paymentController.createPaymentIntent
  );

  app.post('/api/payment/create-setup-intent',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.createSetupIntent
  );

  app.post('/api/payment/set-default-method',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.setDefaultPaymentMethod
  );

  app.post('/api/payment/subscribe',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    subscribeController.subscribe
  );
};
