import paymentController from "../controllers/payments"
import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';

export default app => {
  app.post('/api/payment/add-method',
    bodyParser.json,
    jwtAuth,
    paymentController.addPaymentMethod,
    paymentController.setDefaultPaymentMethod
  );

  app.post('/api/payment/set-default-method',
    bodyParser.json,
    jwtAuth,
    paymentController.setDefaultPaymentMethod);

  app.post('/api/payment/subscribe',
    bodyParser.json,
    jwtAuth,
    paymentController.addPaymentMethod,
    paymentController.setDefaultPaymentMethod,
    paymentController.subscribe
  );
};
