import stripe from '../../utils/stripe'
import Errors from "../../constants/Errors";
import asyncRoute from "../../utils/asyncRoute";
import { q, qNonEmpty } from '../../utils/q'
import p from "../../utils/agents";
import logger from "../../utils/logger";


export default {
  createSetupIntent: asyncRoute( async(req, res, next) => {

    let setupIntent
    try {
      setupIntent = await stripe.setupIntents.create({
        payment_method_types: ['card'],
        customer: customer.id
      });
    } catch(err){
      logger.error(err, '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors()
    }

    return res.status(200).json({
      status: 200,
      result: setupIntent
    })
  }),

  setDefaultPaymentMethod:  asyncRoute( async(req, res, next) => {
    const {
      paymentMethodDbId,
      paymentMethodStripeId,
      customerStripeId,
    } = req.body;

    logger.info(JSON.stringify(req.body), '%o');

    try {
      await p.tx(async client => {
        await client.query(
          `INSERT INTO default_pm (user_id, default_pm_id ) VALUES ($1, $2)
            ON CONFLICT (user_id) DO UPDATE
            SET default_pm_id = $2;
          `,
          [req.user.id, paymentMethodDbId]
        )
        await stripe.customers.update(
          customerStripeId,
          {
            invoice_settings: {
              default_payment_method: paymentMethodStripeId
            }
          });
      })
    }
    catch(err){
      logger.error(err, '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors()
    }

    if(typeof next != "undefined"){
      return next()
    }
    return res.status(200).json({
      status: 200,
    })
  })
};
