import asyncRoute from "../../utils/asyncRoute";
import logger from "../../utils/logger";
import stripe from "../../utils/stripe";
import Errors from "../../constants/Errors";
import {qNonEmpty} from "../../utils/q";

export default asyncRoute(async (req, res, next) => {
    const {user} = req;
    logger.info(user, '%o');
    const {id: userId, email, stripe_id} = user;

    let customer;
    let existedIdenticalCustomers;

    if (stripe_id === null) {
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
      if (existedIdenticalCustomers.data.length === 0) {
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
      } else {
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
  })