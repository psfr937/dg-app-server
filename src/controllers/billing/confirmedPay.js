import stripe from '../../utils/stripe'
import Errors from "../../constants/Errors";
import asyncRoute from "../../utils/asyncRoute";
import { q, qNonEmpty } from '../../utils/q'
import p from "../../utils/agents";
import logger from "../../utils/logger";


export default {

  confirmedPaymentIntent: asyncRoute(async (res, req, next) => {

    const {user} = req;
    try {

      const paymentIntent = await confirmedPaymentIntent();

      return res.status(200).json({
        status: 200,
        result: paymentIntent.client_secret
      })
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      console.log('Error code is: ', err.code);
      const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
      console.log('PI retrieved: ', paymentIntentRetrieved.id);
    }
  })
}

export const confirmedPaymentIntent = async (price = 10.99, customerId, paymentMethodId) => {
  return await stripe.paymentIntents.create({
    amount: price * 100,
    currency: 'hkd',
    customer: customerId,
    payment_method: paymentMethodId,
    error_on_requires_action: true,
    confirm: true,
  });
};