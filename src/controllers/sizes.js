import asyncRoute from "../utils/asyncRoute";
import { q } from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const questions = (await q(
          `SELECT m.*, p.name as physique, json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name)) as sizes
           FROM measurements m
                    LEFT JOIN sizes s on s.measurement_id = m.id
                    LEFT JOIN physiques p on m.physique_id = p.id
           GROUP BY m.id, p.name;
            `)
      ).rows;
      return res.json({status: 200, data: questions})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  })
}
