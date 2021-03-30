import asyncRoute from "../utils/asyncRoute";
import { q } from "../utils/q";
import Errors from "../constants/Errors";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const sizes = (await q(
        `SELECT b.segment_id as id, b.segment_order as item_order, b.segment as name, COALESCE(json_agg(DISTINCT jsonb_build_object('id', b.physique_id, 'name', b.physique, 'measurements', b.measurements, 'order', b.physique_order)) FILTER (WHERE b.physique_id IS NOT NULL), '[]') as physiques FROM (
SELECT a.segment_id, a.segment, a.segment_order, a.physique_id, a.physique, a.physique_order, COALESCE(json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name, 'sizes', a.sizes, 'order', a.measurement_order)) FILTER (WHERE a.id IS NOT NULL), '[]') as measurements FROM (
   SELECT m.id, m.name, m.item_order as measurement_order,
          p.name as physique, p.id as physique_id, p.item_order as physique_order,
          s2.name as segment, s2.id as segment_id, s2.item_order as segment_order,
          COALESCE(json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'order', s.item_order)) FILTER (WHERE s.id IS NOT NULL), '[]') as sizes
   FROM sizes s
            RIGHT JOIN measurements m on s.measurement_id = m.id
            RIGHT JOIN physiques p on m.physique_id = p.id
            RIGHT JOIN segments s2 on p.segment_id = s2.id
   GROUP BY m.id, p.id, s2.id ) a
GROUP BY a.physique_id, a.physique, a.segment_id, a.segment,  a.segment_order, a.physique_order) b
         GROUP BY b.segment_id, b.segment, b.segment_order;`
      )).rows;
      return res.json({status: 200, data: sizes})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),
  insert: asyncRoute(async (req, res) => {
    const { insert } = req;
    const buildQuery = (data) => {
      let textPlaceHoldersArray = [];
      let argsArray = [];
      data.map((k, i) => {
        textPlaceHoldersArray.push(`$${i + 1}`);
        argsArray.push(k.name);
      });
      return {
        placeHolders: textPlaceHoldersArray.join(', '),
        args: argsArray
      }
    };

    const buildTupleQuery = (data, field) => {
      let textPlaceHoldersArray = [];
      let argsArray = [];
      data.map((k, i) => {
        textPlaceHoldersArray.push(`($${i * 2 + 1}, $${i * 2 + 2})`);
        argsArray.push(k.name);
        argsArray.push(k[field]);
      });
      return {
        placeHolders: textPlaceHoldersArray.join(', '),
        args: argsArray
      }
    };

    try {
      const { paceHolders: segPhs, args: segArgs } = buildQuery(insert.segments);
      const segments = (await q(
        `INSERT INTO segments (name) VALUES ${segPhs}`,
        segArgs
      )).rows;
      const { paceHolders: phyPhs, phyArgs } = buildTupleQuery(insert.physiques, 'segment_id')
      const physiques = (await q(
        `INSERT INTO physiques (name, segment_id) VALUES ${phyPhs}`, phyArgs
      )).rows;
      const { paceHolders: meaPhs, meaArgs } = buildTupleQuery(insert.measurements, 'physique_id')
      const measurements = (await q(
        `INSERT INTO measurements (name, physique_id) VALUES ${meaPhs}`, meaArgs
      )).rows;
      const { paceHolders: sizePhs, sizeArgs } = buildTupleQuery(insert.sizes, 'measurement_id');
      const sizes = (await q(
        `INSERT INTO sizes (name, measurement_id) VALUES ($1, $2)`, [insert.sizes]
      )).rows;
      return res.json({status: 200, data: sizes})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),
  remove: asyncRoute(async (req, res) => {
    const { remove } = req;
    try {
      const sizes = (await q(
        `DELETE FROM sizes WHERE id = $1`, [remove.sizes])).rows;
      const measurements = (await q(
        `DELETE FROM segments WHERE id = $1`, [remove.measurements])).rows;
      const physiques = (await q(
        `DELETE FROM segments WHERE id = $1`, [remove.physiques])).rows;
      const segments = (await q(
        `DELETE FROM segments WHERE id = $1`, [remove.segments])).rows;
      return res.json({status: 200, data: sizes})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),
}
