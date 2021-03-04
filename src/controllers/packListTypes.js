import asyncRoute from "../utils/asyncRoute";
import {qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const plts = (await q(
          `SELECT * FROM packListTypes`)
      ).rows;
      return res.json({status: 200, data: plts})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  })
}