import asyncRoute from "../utils/asyncRoute";
import {qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const products = (await qNonEmpty(
            `SELECT * FROM plans`)
      ).rows
      return res.json({status: 200, data: products})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  })
}