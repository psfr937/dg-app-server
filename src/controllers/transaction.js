import Errors from "../constants/Errors";
import asyncRoute from "../utils/asyncRoute";
import logger from "../utils/logger";
import tx from "../utils/agents"
import { placeOrder } from "./delivery";
import { confirmedPaymentIntent } from "./billing/confirmedPay";
import { q, qNonEmpty } from "../utils/q"

export default {
  buy: asyncRoute( async(req, res, next) => {

    let productCost = 0;
    const { cartItems } = req.body;
    let to = null; let from = null;

    try {
      await q(); //insert payment method
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      throw err;
    }

    try {
      await q(); //update default payment method
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      throw err;
    }

    try {
      to = (await qNonEmpty(`SELECT lat::FLOAT, lng::FLOAT FROM addresses WHERE id = $1`,
        [ req.body.addressId])).rows[0]; //retrieve address from address id

      from = (await qNonEmpty(
        `SELECT lat::FLOAT, lng::FLOAT FROM apps WHERE key = $1`
      , ['dress green'])).rows[0]; //get our own lat lng

      productCost = (await qNonEmpty(`SELECT SUM(price) as total
            FROM inventories
            WHERE id = ANY($1::INT[])`, [cartItems])).rows[0].total; //calculate product total cost
    }
    catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors();
    }

    try {
      await tx(async client => {
        try {
          await client.query(); //insert into payment
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }
        try {
          await client.query(); //insert into order (payment_id, inventories_id)
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

        try {
          await client.query(); //set inventory to sold
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

        try {
          await placeOrder('van', 7, from, to) // gogovan delivery;
        } catch (err) {
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

      });
    }catch(err){
      res.pushError([Errors.GOGOVAN_API_ERROR(err)]);
      return res.errors();
    }

    try{
      await confirmedPaymentIntent(
        productCost,
        req.user.stripe_id,
        req.body.paymentMethodId
      )
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors();
    }

    //send notice email

    return res.status(200).json({
      status: 200,
      result: 'ok'
    })
  }),

  sell:  asyncRoute( async(req, res, next) => {

    try {
      await q(); //insert payment method
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      throw err;
    }

    try {
      await q(); //update default payment method
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      throw err;
    }


    let productCost = 0;
    let to = null; let from = null;
    try {
      to = (await qNonEmpty(`SELECT lat::FLOAT, lng::FLOAT FROM addresses WHERE id = $1`,
        [ req.body.addressId])).rows[0]; //retrieve address from address id

      from = (await qNonEmpty(
        `SELECT lat::FLOAT, lng::FLOAT FROM apps WHERE key = $1`
        , ['dress green'])).rows[0]; //get our own lat lng

    }
    catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors();
    }

    try {
      await tx(async client => {
        try {
          await client.query(); //insert into payment
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

        try {
          await client.query(); //insert into inventory (selling id)
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

        try {
          await client.query(); //insert into selling (payment_id)
        }catch(err){
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

        try {
          await placeOrder('van', 7, from, to) // gogovan delivery;
        } catch (err) {
          logger.error(JSON.stringify(err), '%o');
          throw err;
        }

      });
    }catch(err){
      res.pushError([Errors.GOGOVAN_API_ERROR(err)]);
      return res.errors();
    }

    try{
      await confirmedPaymentIntent(
        productCost,
        req.user.stripe_id,
        req.body.paymentMethodId
      )
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.PAYMENT_ERROR(err)]);
      return res.errors();
    }

    return res.status(200).json({
      status: 200,
      result: 'ok'
    })
  })
};
