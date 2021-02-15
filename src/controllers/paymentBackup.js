import stripe from '../utils/stripe'
import Errors from "../constants/Errors";
import asyncRoute from "../utils/asyncRoute";
import { q, qNonEmpty } from '../utils/q'
import p from "../utils/agents";
import logger from "../utils/logger";


export default {
  createCustomer: asyncRoute(async(req, res, next) => {
    const {user} = req;
    logger.info(user, '%o');
    const { id: userId, email, stripe_id } = user;

    let customer;
    let existedIdenticalCustomers;

    if(stripe_id === null) {
      try {
        existedIdenticalCustomers = await stripe.customers.list({
          limit: 3,
          email: email
        });
      } catch (err) {
        logger.error(err, '%o');
        res.pushError([Errors.PAYMENT_ERROR(err)])
        return res.errors()
      }
      if(existedIdenticalCustomers.data.length === 0) {
        try {
          customer = await stripe.customers
            .create({
              email: email,
              description: userId
            });
        } catch (err) {
          logger.error(err, '%o');
          res.pushError([Errors.PAYMENT_ERROR(err)])
          return res.errors()
        }
      }
      else{
        customer = existedIdenticalCustomers.data[0]
      }

      try {
        await qNonEmpty(
          `UPDATE users SET stripe_id = $1 WHERE id = $2 RETURNING id`,
          [customer.id, userId]
        )
        req.user = {...req.user, stripe_id: customer.id}
      } catch (err) {
        logger.error(err, '%o')
        res.pushError([Errors.PAYMENT_ERROR(err)])
        return res.errors()
      }
    }

    if (typeof next != "undefined") {
      return next()
    }
    return res.status(200).json({
      status: 200,
      result: 'Customer account creation success'
    })
  }),

  fetchPaymentMethods: asyncRoute( async(req, res, next) => {
    const {user} = req;
    let paymentMethods;
    let defaultPaymentMethod;
    try {
      defaultPaymentMethod = await q(`SELECT pm_id FROM default_pm WHERE user_id = $1`, [user.id]);
      paymentMethods = await q(`SELECT * FROM pms WHERE user_id = $1`, [user.id])
    }
    catch(err){
      res.pushError([Errors.PAYMENT_ERROR(err)])
      return res.errors()
    }

    return res.status(200).json({
      status: 200,
      result: {
        defaultPaymentMethod,
        paymentMethods
      }
    })
  }),

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


  addPaymentMethod: asyncRoute( async(req, res, next) => {
    const {user} = req;
    const token = req.body.token;
    const setupIntentId = req.body.setupIntentId
    logger.info(user, '%o');

    let paymentMethod;
    let customer;
    let setupIntent;

    try {
      paymentMethod = await stripe.paymentMethods.attach(
        token,
        {customer: user.stripe_id}
      );
      req.body = {...req.body, paymentMethodStripeId: paymentMethod.id}
    }
    catch(err){
      logger.error(err, '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors()
    }


    try {
      await stripe.setupIntents.confirm(
        setupIntent.id,
        {
          payment_method: paymentMethod.id
        }
      );
    }catch(err){
      logger.error(err, '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors()
    }

    try {
      const insertPm = await qNonEmpty(
        `INSERT INTO pms (stripe_id) VALUES ($1) RETURNING id`,
        [paymentMethod.id]
      );

      req.body = {...req.body, paymentMethodDbId: insertPm.rows[0].id}
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
      result: paymentMethod
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
  }),

  pay: asyncRoute(async(req,res) => {
    const {
      paymentMethodStripeId,
      paymentMethodDbId,
      planId,
      planStripeId
    } = req.body;

    let payment;
    let insertPayment;

    try {
      await p.tx(async client => {

        const plan = await client.query(`SELECT stripe_id FROM plans WHERE id = $1`,
          [planId]
        )
        if(plan.rowsCount === 0 || typeof plan.rows[0].stripe_id !== 'string'){
          throw new Error('Plan ID not found')
        }
        const planStripeId = plan.rows[0].stripe_id;

        insertPayment = await client.query(
          `INSERT INTO payments (user_id, pm_id, plan_id) 
          VALUES ($1, $2, $3) RETURNING id`,
          [
            req.user.id,
            paymentMethodDbId,
            planId
          ]
        )

        if(!(Array.isArray(insertPayment.rows) && insertPayment.rows.length > 0)){
          throw new Error('DATABASE INSERTION FAILED')
        }
        logger.info(planStripeId, '%o');
        payment = await stripe.subscriptions.create({
          customer: req.user.stripe_id,
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
      if(typeof payment === 'object' && 'id' in payment
        && typeof insertPayment === 'object' && 'rows' in insertPayment
        && Array.isArray(insertPayment.rows) && insertPayment.rows.length > 0 &&
        'id' in insertPayment.rows[0]
      ) {
        await q(
          `UPDATE payments SET stripe_id = $1 WHERE id = $2`,
          [
            payment.id,
            insertPayment.rows[0].id
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
      result: payment
    })
  }),

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
