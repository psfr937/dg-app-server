import bodyParser from '../middlewares/bodyParser';
import { jwtAuth } from '../middlewares/jwtAuth';
import setupPaymentController from"../controllers/billing/setupPayment"
import checkStripeCustomer from "../controllers/billing/checkStripeCustomer";
import subscribeController from "../controllers/billing/subscribe";
import mail from "../controllers/mail"
import {
  buyPostDelivery, buy,
  confirmedPayAndRecord, savePaymentMethod, sellPostDelivery,
  transactionDeliveryOrder
} from "../controllers/transaction";
export default app => {


  app.post('/transaction/buy',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    savePaymentMethod,
    buy,
    transactionDeliveryOrder,
    buyPostDelivery,
    confirmedPayAndRecord,
    mail.sendBuyReceipt
  );

  app.post('/transaction/sell',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    savePaymentMethod,
    transactionDeliveryOrder,
    sellPostDelivery,
    confirmedPayAndRecord
  );

  app.post('/transaction/add-payment-method',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    subscribeController.subscribe
  );


  app.post('/transaction/set-default-method',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    setupPaymentController.setDefaultPaymentMethod
  );

  app.post('/transaction/subscribe',
    bodyParser.json,
    jwtAuth,
    checkStripeCustomer,
    subscribeController.subscribe
  );
};
