import asyncRoute from "../utils/asyncRoute";
import {qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import logger from "../utils/logger";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      logger.info(JSON.stringify(req.body.data), '%o');
      const cid = (await qNonEmpty(
            `SELECT * FROM inventories 
                    WHERE id = ANY($1::int[])`,
          [req.body.data]
        )
      ).rows
      return res.json({status: 200, data: cid})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),
}