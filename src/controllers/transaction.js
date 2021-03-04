import p from "../utils/agents";
import logger from "../utils/logger";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import {confirmedPaymentIntent} from "./billing/confirmedPay";
import {placeDeliveryOrder} from "./delivery";
import asyncRoute from "../utils/asyncRoute";
import stripe from '../utils/stripe'

export const savePaymentMethod = asyncRoute(async (req, res, next) => {
  const { paymentMethod } = req.body;
  if(typeof paymentMethod === 'string'){
    try {

      const stripePm = await stripe.paymentMethods.retrieve(
        paymentMethod
      );

     const card = stripePm.card

      await p.tx(async client => {
        const insertPmResult = (await client.query(
          `INSERT INTO pms (user_id, stripe_id, funding, 
                 fingerprint, last_four, exp_month, exp_year)
                 VALUES ($1::INTEGER, $2::TEXT, $3::TEXT, $4::TEXT, $5::TEXT, $6::INTEGER, $7::INTEGER) 
                 ON CONFLICT (stripe_id) DO UPDATE SET funding = $8 RETURNING id;`,
          [ req.user.id,
            paymentMethod,
            card.funding,
            card.fingerprint,
            card.last4,
            card.exp_month, card.exp_year, card.funding ]
        )).rows;
        if(insertPmResult.length === 0){
          throw new Error('insert failed')
        }

        const pmDbId = insertPmResult[0].id;
        logger.info(pmDbId, '%o')
        try {
          await client.query(`INSERT INTO default_pm (user_id, default_pm_id)
                              VALUES ($1, $2)
                              ON CONFLICT (user_id) DO UPDATE SET default_pm_id = $3;`,
            [req.user.id, pmDbId, pmDbId]);
        }
        catch(err){
          console.log(err)
          logger.error(JSON.stringify(err), '%o');
          throw err
        }
        req.pmDbId = pmDbId;
        req.pmStripeId = paymentMethod;
      });
    }catch(err){
      console.log(err)
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors();
    }
  }
  else if (typeof paymentMethod === 'number'){
    req.pmDbId = paymentMethod;
    req.pmStripeId = (await
      qNonEmpty('SELECT stripe_id FROM pms WHERE id = $1', [paymentMethod])).rows[0].stripe_id
  }
  else{
    logger.error('Bad request', '%o');
    res.pushError([Errors.BAD_REQUEST]);
    return res.errors();
  }
  return next();
});

export const transactionDeliveryOrder = asyncRoute(async(req, res, next) => {
  let lastQuotation = null;
  try{
    lastQuotation = (await qNonEmpty(`
              SELECT * FROM quotations WHERE id = $1 AND user_id = $2 
              ORDER BY created_at DESC LIMIT 1`,
      [ req.body.quotationId, req.user.id ])).rows[0];
  }
  catch(err){
    logger.error(JSON.stringify(err), '%o');
    res.pushError([Errors.DB_OPERATION_FAIL(err)]);
    return res.errors();
  }
  try {
    const from = {
      lat: lastQuotation.from_lat,
      lng: lastQuotation.from_lng,
      lineOne: lastQuotation.from_line_one,
      lineTwo: lastQuotation.from_line_two,
      recipientPhone: lastQuotation.from_phone,
      recipientName: lastQuotation.from_name
    };
    const to = {
      lat: lastQuotation.to_lat,
      lng: lastQuotation.to_lng,
      lineOne: lastQuotation.to_line_one,
      lineTwo: lastQuotation.to_line_two,
      recipientPhone: lastQuotation.to_phone,
      recipientName: lastQuotation.to_name
    };
    const deliveryType = lastQuotation.delivery_type;
    const scheduleAt = lastQuotation.schedule_at;
    const deliveryOrderResult = await placeDeliveryOrder(deliveryType, scheduleAt, from, to); // gogovan delivery;
    console.log(deliveryOrderResult.data)

    req.lastQuotation = lastQuotation
    req.deliveryResult = deliveryOrderResult.data
    req.deliveryCost = lastQuotation.delivery_cost

    return next()
  } catch (err) {
    logger.error(JSON.stringify(err), '%o');
    res.pushError([Errors.GOGOVAN_API_ERROR(err)]);
    return res.errors();
  }
});

export const buyPostDelivery = asyncRoute(async(req, res, next) => {

  let productDetail;
  try {
    productDetail = (await qNonEmpty(`SELECT * FROM inventories
              WHERE id = ANY($1::INT[])`,
      [req.body.cartItems]))
      .rows; //calculate product total cost
  }
  catch(err){
    logger.error(JSON.stringify(err), '%o');

    res.pushError([Errors.DB_OPERATION_FAIL(err)]);
    return res.errors();
  }
  req.productDetail = productDetail;
  req.productCost = productDetail.reduce((acc, cur) => acc + cur.price);
  req.cost = req.productCost + req.deliveryCost;
  return next()
});

export const sellPostDelivery = (req, res, next) => {
  req.cost = req.deliveryCost;
  return next()
};

export const buy = asyncRoute( async(req, res, next) => {
  try {
    const { cartItems } = req.body
    await p.tx(async client => {
      let arrayParameters = [];
      let placeHoldersArray = [];
      let placeHolderString = '';
      const orderId = (await client.query(`INSERT INTO orders (user_id) VALUES ($1) RETURNING id`,
        [req.user.id])).rows[0].id; //insert into order (payment_id, inventories_id)

      cartItems.map((k, i) => {
        placeHoldersArray.push(`($${i*2 + 1}, $${i*2 + 2})`);
        arrayParameters.push(k);
        arrayParameters.push(orderId);
      });
      placeHolderString = placeHoldersArray.join(', ');

      await client.query(`INSERT INTO inventory_order (inventory_id, order_id) 
                VALUES ${placeHolderString}`, arrayParameters); //insert into order (payment_id, inventories_id)
      await client.query(`UPDATE inventories SET sold = true WHERE id = ANY($1::INT[])`,
        [cartItems]); //set inventory to sold
    });
    return next();
  }catch(err){
    console.log(err);
    logger.error(JSON.stringify(err), '%o');
    res.pushError([Errors.DB_OPERATION_FAIL(err)]);
    return res.errors();
  }
});

export const confirmedPayAndRecord = asyncRoute(async (req, res, next) => {
  let stripeResult;
  try{
    console.log(req.cost)
    console.log(req.user.stripe_id)
    console.log(req.pmStripeId)
    stripeResult = await confirmedPaymentIntent(
      req.cost,
      req.user.stripe_id,
      req.pmStripeId
    )
  }catch(err){
    logger.error(JSON.stringify(err), '%o');
    res.pushError([Errors.PAYMENT_ERROR(err)]);
    return res.errors();
  }
  console.log(req.pmStripeId)
  console.log(req.pmDbId)
  const insertPaymentResult = (await q(`INSERT INTO payments (stripe_id, pm_id, amount, currency)
                VALUES ($1, $2, $3, $4) RETURNING id`,
    [req.pmStripeId, req.pmDbId, req.cost, 'HKD'])).rows; //insert into payment
  if(insertPaymentResult.length === 0){
    res.pushError([Errors.DB_OPERATION_FAIL('insert failed')]);
    return res.errors();
  }
  req.emailData = {
    total: req.cost,
    items: req.productDetail.map(i => {
      return {
        picture_url: i.picture_url,
        name: i.name,
        price: `HK$ ${i.price/100}`
      }
    }),
    receipt: true,
    name: req.lastQuotation.to_name,
    address01: req.lastQuotation.to_line_one,
    address02: req.lastQuotation.to_line_two,
    city: req.lastQuotation.city
  };

  return res.status(200).json({
    status: 200,
    data: {
      stripeResult,
      deliveryResult: req.deliveryResult
    }
  })
});

/*
a) LPFA assumption (low price fluctuation amplitude)
this strategy assumes the amplitude of delivery quotation fluctuation is low
do the storing in quotation controller

b) Never Bounce Back Policy for Legit User (NBBLU): backend never reject or bounce back purchase request
 for legit user

c) WS upgrade plan for Last Seconds True Information (WS-LSTI):
The anticipation that WS upgrade plan will be used for LSTI means that
even if client may send wrong pricing information, the delta is at max a few seconds.
 this reduces the difference of prices in real business use case, to meet the LPFA assumption

-----
1) the backend get the latest quotation of that user, with all the delivery information

2) Due to NBBLU, getting a quotation again at this stage is useless.
Also due to LPFA, the api should now directly place an order

3) Backend then fetch the price of each items that user request from backend
To manage the remaining LFPA,
check the prices according to the current time

if the current price is lower than user given price, use the current price.
if client price is lower, check if the timestamp is less than 5 minutes
if yes, check in the database the price of that timestamp.
If they are the same, use the client price
(WS-LSTI ensures if otherwise happens, it is a hacker or lost connection of client).

3b) check price change database
if there is any id in  client's itemList and that the change time is larger
than the client's itemList timeStamp
then take that price in database and compare it with the client's price, take the smaller value

4) Continue to Stripe payment api
5) Insert payment to db for future reference use

*/