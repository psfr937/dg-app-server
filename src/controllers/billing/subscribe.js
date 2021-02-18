import stripe from '../../utils/stripe'
import Errors from "../../constants/Errors";
import asyncRoute from "../../utils/asyncRoute";
import { q, qNonEmpty } from '../../utils/q'
import p from "../../utils/agents";
import logger from "../../utils/logger";


export default {
  subscribe:  asyncRoute( async(req, res) => {
    const {
      paymentMethodStripeId,
      paymentMethodDbId,
      customerStripeId,
      planId,
      planStripeId
    } = req.body;

    let subscription;
    let insertSubscription;

    try {
      await p.tx(async client => {

        const plan = await client.query(`SELECT stripe_id FROM plans WHERE id = $1`,
          [planId]
        );
        if(plan.rowsCount === 0 || typeof plan.rows[0].stripe_id !== 'string'){
          throw new Error('Plan ID not found')
        }
        const planStripeId = plan.rows[0].stripe_id;

        insertSubscription = await client.query(
          `INSERT INTO subscriptions (user_id, pm_id, plan_id) 
          VALUES ($1, $2, $3) RETURNING id`,
          [
            req.user.id,
            paymentMethodDbId,
            planId
          ]
        );

        if(!(Array.isArray(insertSubscription.rows) && insertSubscription.rows.length > 0)){
          throw new Error('DATABASE INSERTION FAILED')
        }
        logger.info(planStripeId, '%o');
        subscription = await stripe.subscriptions.create({
          customer: customerStripeId,
          items: [{plan: planStripeId}],
          default_payment_method: paymentMethodStripeId
        })
      })
    }
    catch(err){
      logger.error(err, '%o');
      res.pushError(Errors.PAYMENT_ERROR(err));
      return res.errors()
    }

    try{
      if(typeof subscription === 'object' && 'id' in subscription
        && typeof insertSubscription === 'object' && 'rows' in insertSubscription
        && Array.isArray(insertSubscription.rows) && insertSubscription.rows.length > 0 &&
        'id' in insertSubscription.rows[0]
      ) {
        await q(
          `UPDATE subscriptions SET stripe_id = $1 WHERE id = $2`,
          [
            subscription.id,
            insertSubscription.rows[0].id
          ]
        )
      }
      else{
        throw new Error('Invalid subscription object')
      }
    }
    catch(err){
      logger.error(err, '%o');
      res.pushError(Errors.PAYMENT_ERROR(err));
      return res.errors()
    }

    return res.status(200).json({
      status: 200,
      result: subscription
    })
  })
};
