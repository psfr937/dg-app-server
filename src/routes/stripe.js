import paymentController from "../controllers/billing/pay"
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import setupPaymentController from"../controllers/billing/setupPayment"
import checkStripeCustomer from "../controllers/billing/checkStripeCustomer";

export default app => {
  app.post('/api/stripe/create-payment-intent',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    paymentController.createPaymentIntent
  );

  app.post('/api/stripe/create-setup-intent',
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.createSetupIntent
  );
};
