import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";


export default {

  get: asyncRoute(async (req, res) => {
    try {
      const inventory = (await qNonEmpty(
          `SELECT i.id, i.brand, i.price, COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name,
                                                                                        'aspect', a.name )) FILTER (WHERE it2.id IS NOT NULL), '[]') as tags,
                  COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'measurement_id', m.id, 'measurement_name', m.name,
                                                                'physique_id', p.id, 'physique_name', p.name)) FILTER (WHERE it2.id IS NOT NULL), '[]') as sizes,
                  COALESCE(json_agg(DISTINCT jsonb_build_object('name', it2.name, 'description', it2.description,
                                                                'language', it2.language))  FILTER (WHERE it2.language IS NOT NULL), '[]') as text,
                  COALESCE(json_agg(DISTINCT jsonb_build_object('url', ii.url, 'order', ii.item_order)) FILTER (WHERE it2.id IS NOT NULL), '[]') as images,
                  jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email) as seller
           FROM inventories i
                    LEFT JOIN inventory_tag it ON i.id = it.inventory_id
                    LEFT JOIN inventory_size i_s on i.id = i_s.inventory_id
                    LEFT JOIN sizes s ON i_s.size_id = s.id
                    LEFT JOIN measurements m ON s.measurement_id = m.id
                    LEFT JOIN physiques p ON m.physique_id = p.id
                    LEFT JOIN tags t on it.tag_id = t.id
                    LEFT JOIN aspects a ON t.aspect_id = a.id
                    LEFT JOIN inventory_text it2 on i.id = it2.inventory_id
                    LEFT JOIN users u on i.seller_id = u.id
                    LEFT JOIN image_inventory ii on ii.inventory_id = i.id
           WHERE i.id = $1 GROUP BY i.id, i.brand, u.id, u.name, u.email, i.price`, [req.params.id])
      ).rows[0];
      return res.json({status: 200, data: inventory})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  delete: asyncRoute(async (req, res) => {
    try {
      const inventory = (await qNonEmpty(
          `SELECT *
           FROM inventories WHERE id = $1`, [req.params.id])
      ).rows[0];
      return res.json({status: 200, data: inventory})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

}
