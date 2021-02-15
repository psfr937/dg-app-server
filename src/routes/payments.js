import paymentController from "../controllers/payments"
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';

export default app => {

  app.post('/api/payment/add-method',
    bodyParser.json,
    jwtAuth,
    paymentController.createCustomer,
    paymentController.addPaymentMethod,
    paymentController.setDefaultPaymentMethod
  );

  app.post('/api/payment/set-default-method',
    bodyParser.json,
    jwtAuth,
    paymentController.setDefaultPaymentMethod
  );



  app.post('/api/payment/subscribe',
    bodyParser.json,
    jwtAuth,
    paymentController.setDefaultPaymentMethod,
    paymentController.subscribe
  );

  app.post('/api/payment/create-payment-intent',
    bodyParser.json,
    jwtAuth,
    paymentController.createPaymentIntent
  )

  app.post('/api/payment/pay',
    bodyParser.json,
    jwtAuth,
    paymentController.setDefaultPaymentMethod,
    paymentController.subscribe
  );

  app.post('/create-checkout-session',  bodyParser.json, paymentController.createCheckoutSession)
};
