import asyncRoute from "../utils/asyncRoute";
import logger from "../utils/logger";
import {q} from "../utils/q";
import Errors from "../constants/Errors";

// For the default version

// For the default version
import algoliasearch from 'algoliasearch';

// For the search only version

const client = algoliasearch('XSR6ZP990B', '92a22a67e9359afb1af47e780d29e6d3');
const index = client.initIndex('dev_dg');

export default {
  insertAll: asyncRoute(async (req, res, next) => {
    try {
      const objects = (await q(
          `WITH common AS (
    SELECT i.id,  i.price, i.brand, json_agg(DISTINCT seg.name) as segment,
           json_agg(DISTINCT (p.name || ' > ' || m.name || ' > ' || s.name) ) as size,
           json_agg(DISTINCT jsonb_build_object('id', ii.id, 'url', ii.url, 'order', ii.item_order)) as images,
           json_agg(DISTINCT jsonb_build_object('id', it2.id, 'name', it2.name, 'description', it2.description,
                                                'language', it2.language)) as text
    FROM inventories i
             LEFT JOIN inventory_size i_s on i.id = i_s.inventory_id
             LEFT JOIN sizes s ON i_s.size_id = s.id
             LEFT JOIN measurements m ON s.measurement_id = m.id
             LEFT JOIN physiques p ON m.physique_id = p.id
             LEFT JOIN segments seg ON p.segment_id = seg.id
             LEFT JOIN image_inventory ii on ii.inventory_id = i.id

             LEFT JOIN inventory_text it2 on i.id = it2.inventory_id
    GROUP BY i.id, i.brand, i.price
),
     tag AS (
         SELECT i.id, t.name as name, a.name as aspect
         FROM inventories i
                  LEFT JOIN inventory_tag it ON i.id = it.inventory_id
                  LEFT JOIN tags t ON t.id = it.tag_id
                  LEFT JOIN aspects a ON t.aspect_id = a.id
     ), accent AS (
    SELECT tag.id, json_agg(name) as name
    FROM tag
    WHERE aspect = 'accent' GROUP BY tag.id
), material AS (
    SELECT tag.id, json_agg(name) as name
    FROM tag
    WHERE aspect = 'material' GROUP BY tag.id
),
     color AS (
         SELECT tag.id, json_agg(name) as name
         FROM tag
         WHERE aspect = 'color' GROUP BY tag.id
     ),
     category AS (
         SELECT tag.id, json_agg(name) as name
         FROM tag
         WHERE aspect = 'category' GROUP BY tag.id
     )

SELECT DISTINCT ON (common.id) common.images, common.id, common.text, common.size as size,
                               common.brand, common.price, common.segment,
material.name as material, accent.name as accent, category.name as category,
                               color.name as color FROM common
                                                            LEFT JOIN category ON common.id = category.id
                                                            LEFT JOIN color ON common.id = color.id
                                                            LEFT JOIN material ON common.id = material.id
                                                            LEFT JOIN accent ON common.id = accent.id;` )
      ).rows;

      objects.forEach(o => {
        o["objectID"] = o.id;
      });
     const objectIDs = await index.saveObjects(objects)
      return res.json({status: 200, data: objectIDs})
    } catch (err) {
      console.log(err)
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }
  }),
  setting: asyncRoute(async (req, res, next) => {
  try{
    await index.setSettings({
      attributesForFaceting: [
        'brand'
      ]
    })
    return res.json({status: 200, data: 'OK'})
  } catch (err) {
    console.log(err)
    logger.error(JSON.stringify(err), '%o');
    res.pushError([Errors.DB_OPERATION_FAIL(err)])
    return res.errors()
  }
  }),
  upsert: asyncRoute(async (req, res, next) => {
    try {
      const objects = (await q(
          `WITH common AS (
    SELECT i.id,  i.price, i.brand, json_agg(DISTINCT seg.name) as segment,
           json_agg(DISTINCT (p.name || ' > ' || m.name || ' > ' || s.name) ) as size,
           json_agg(DISTINCT jsonb_build_object('id', ii.id, 'url', ii.url, 'order', ii.item_order)) as images,
           json_agg(DISTINCT jsonb_build_object('id', it2.id, 'name', it2.name, 'description', it2.description,
                                                'language', it2.language)) as text
    FROM inventories i
             LEFT JOIN inventory_size i_s on i.id = i_s.inventory_id
             LEFT JOIN sizes s ON i_s.size_id = s.id
             LEFT JOIN measurements m ON s.measurement_id = m.id
             LEFT JOIN physiques p ON m.physique_id = p.id
             LEFT JOIN segments seg ON p.segment_id = seg.id
             LEFT JOIN image_inventory ii on ii.inventory_id = i.id

             LEFT JOIN inventory_text it2 on i.id = it2.inventory_id
    WHERE i.id = $1 GROUP BY i.id, i.brand, i.price
),
     tag AS (
         SELECT i.id, t.name as name, a.name as aspect
         FROM inventories i
                  LEFT JOIN inventory_tag it ON i.id = it.inventory_id
                  LEFT JOIN tags t ON t.id = it.tag_id
                  LEFT JOIN aspects a ON t.aspect_id = a.id
     ), accent AS (
    SELECT tag.id, json_agg(name) as name
    FROM tag
    WHERE aspect = 'accent' GROUP BY tag.id
), material AS (
    SELECT tag.id, json_agg(name) as name
    FROM tag
    WHERE aspect = 'material' GROUP BY tag.id
),
     color AS (
         SELECT tag.id, json_agg(name) as name
         FROM tag
         WHERE aspect = 'color' GROUP BY tag.id
     ),
     category AS (
         SELECT tag.id, json_agg(name) as name
         FROM tag
         WHERE aspect = 'category' GROUP BY tag.id
     )

SELECT DISTINCT ON (common.id) common.images, common.id, common.text, common.size as size,
                               common.brand, common.price, common.segment,
material.name as material, accent.name as accent, category.name as category,
                               color.name as color FROM common
                                                            LEFT JOIN category ON common.id = category.id
                                                            LEFT JOIN color ON common.id = color.id
                                                            LEFT JOIN material ON common.id = material.id
                                                            LEFT JOIN accent ON common.id = accent.id;`,
          [req.data.inventoryId])
      ).rows;

      objects.forEach(o => {
        o["objectID"] = o.id;
      });
      const objectIDs = await index.saveObjects(objects)
      return res.json({status: 200, data: req.data.inventoryId})
    } catch (err) {
      console.log(err)
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }
  }),
  remove: asyncRoute(async (req, res, next) => {
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
  clearObjects: asyncRoute(async (req, res, next) => {
    try{
      await index.clearObjects();
      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      console.log(err)
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }
  }),
}