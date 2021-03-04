import paymentController from "../controllers/billing/pay"
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import setupPaymentController from"../controllers/billing/setupPayment"
import checkStripeCustomer from "../controllers/billing/checkStripeCustomer";

export default app => {
  app.post('/stripe/create-payment-intent',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    paymentController.createPaymentIntent
  );

  app.post('/stripe/create-setup-intent',
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.createSetupIntent
  );
};
