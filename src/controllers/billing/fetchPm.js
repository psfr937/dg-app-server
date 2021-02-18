import asyncRoute from "../../utils/asyncRoute";
import {q} from "../../utils/q";
import Errors from "../../constants/Errors";

export default {
  fetchPaymentMethods: asyncRoute(async (req, res, next) => {
    const {user} = req;
    let paymentMethods;
    let defaultPaymentMethod;
    try {
      defaultPaymentMethod = await q(`SELECT pm_id FROM default_pm WHERE user_id = $1`, [user.id]);
      paymentMethods = await q(`SELECT * FROM pms WHERE user_id = $1`, [user.id])
    } catch (err) {
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
  })
}