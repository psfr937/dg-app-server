import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const tags = (await q(
          `SELECT a.*, json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name)) as tags
           FROM aspects a
                    LEFT JOIN tags t on t.aspect_id = a.id
           GROUP BY a.id;`)
      ).rows;
      return res.json({status: 200, data: tags})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  listOneCategory: asyncRoute(async (req, res) => {
    try {
      const tags = (await q(
          `SELECT * FROM tags t INNER JOIN tag_text tt on t.id = tt.tag_id 
                INNER JOIN aspects a on t.aspect_id = a.id 
            WHERE a.name = $1 GROUP BY t.id`, [req.query.aspect])
      ).rows;
      return res.json({status: 200, data: tags})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  })

}
