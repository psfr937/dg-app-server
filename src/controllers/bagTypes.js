import asyncRoute from "../utils/asyncRoute";
import {q} from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const bts = (await q(
          `SELECT * FROM bag_types`)
      ).rows;
      return res.json({status: 200, data: bts})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  })
}