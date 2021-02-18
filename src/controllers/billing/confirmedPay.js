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

      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'hkd',
        customer: user.stripe_id,
        payment_method: '{{PAYMENT_METHOD_ID}}',
        error_on_requires_action: true,
        confirm: true,
      });

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