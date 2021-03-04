import asyncRoute from "../utils/asyncRoute";
import logger from "../utils/logger";
import {q} from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res, next) => {
    try {
      logger.info(JSON.stringify(req.body.data), '%o');
      const cid = (await q(
          `SELECT * FROM addresses 
                    WHERE user_id = $1`,
          [req.user.id]
        )
      ).rows;

      return res.json({status: 200, data: cid})
    } catch (err) {
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }
  }),
}