import stripe from '../../utils/stripe'
import Errors from "../../constants/Errors";
import asyncRoute from "../../utils/asyncRoute";
import logger from "../../utils/logger";
import { q } from '../../utils/q'

export default {

  createPaymentIntent: asyncRoute(async(req, res, next) => {
    const { user } = req;
    const cart = req.body.cart;
    let paymentIntent;
    try {
      const amount = await q(`SELECT SUM(price)
            FROM inventories
            WHERE some_id = ANY($1::INT[])`, [cart]);

      paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'hkd',
        customer: user.stripe_id,
        setup_future_usage: 'on_session'
      });
    } catch (err) {
      // Error code will be authentication_required if authentication is needed
      logger.error(JSON.stringify(err), '%o');
     // const paymentIntentRetrieved = await stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
     // console.info(`PI retrieved:  ${paymentIntentRetrieved.id}`, '%o');
      res.pushError([Errors.SERVER_EXCEPTION(err)]);
      return res.errors();
    }

    return res.status(200).json({
      status: 200,
      result: paymentIntent.client_secret
    })
  })
};
