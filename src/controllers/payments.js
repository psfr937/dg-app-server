import stripe from '../utils/stripe'
import Errors from "../constants/Errors";
import asyncRoute from "../utils/asyncRoute";
import { q, qNonEmpty } from '../utils/q'
import p from "../utils/agents";
import logger from "../utils/logger";


export default {
  createCheckoutSession: asyncRoute( async(req, res) => {

    const { quantity, locale } = req.body;

    // The list of supported payment method types. We fetch this from the
    // environment variables in this sample. In practice, users often hard code a
    // list of strings for the payment method types they plan to support.
    const pmTypes = (process.env.PAYMENT_METHOD_TYPES || 'card').split(',').map((m) => m.trim());

    // Create new Checkout Session for the order
    // Other optional params include:
    // [billing_address_collection] - to display billing address details on the page
    // [customer] - if you have an existing Stripe Customer ID
    // [customer_email] - lets you prefill the email input in the Checkout page
    // For full details see https://stripe.com/docs/api/checkout/sessions/create
    const session = await stripe.checkout.sessions.create({
      payment_method_types: pmTypes,
      mode: 'payment',
      locale: locale,
      billing_address_collection: 'required',
      line_items: [
        {
          price: 'price_1IKOmNCRRNHI4u4IX2MAFoz2',
          quantity: quantity
        },
      ],
      // ?session_id={CHECKOUT_SESSION_ID} means the redirect will have the session ID set as a query param
      success_url: `http://localhost:3000/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:3000/canceled.html`,
    });

    res.send({
      sessionId: session.id,
    });
  }),


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

  createPaymentIntent: asyncRoute(async(req, res, next) => {

    const { user } = req;
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'hkd',
        customer: user.stripe_id
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
  }),

  createNextPaymentIntent: asyncRoute(async(res, req, next) => {

    const { user } = req;
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
