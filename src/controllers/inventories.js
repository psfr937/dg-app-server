
import logger from '../utils/logger'
import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import p from '../utils/agents'

const makeQuery = (list, inventoryId) => {
  let placeHoldersArray = [];
  let arrayParameters = [];
  list.map((k, i) => {
    placeHoldersArray.push(`($${i*2 + 1}, $${i*2 + 2})`);
    arrayParameters.push(k);
    arrayParameters.push(inventoryId);
  });
  let placeHoldersString = placeHoldersArray.join(', ');
  return {
    placeHoldersString,
    arrayParameters
  }
};

export default {
  list: asyncRoute(async (req, res) => {
    const { filter } = req.body;
    try {
      console.log(req);
      let query = `SELECT i.id, t2.name as brand, i.price, json_agg(DISTINCT jsonb_build_object('tag_id', t.id, 'tag_name', t.name)) as tags,
             json_agg(DISTINCT jsonb_build_object('size_id', s.id, 'size_name', s.name, 'measurement_id', m.id, 'measurement_name', m.name,
                                                  'physique_id', p.id, 'physique_name', p.name)) as sizes,
             json_agg(DISTINCT jsonb_build_object('id', it2.id, 'name', it2.name, 'description', it2.description,
                                                  'language', it2.language)) as text,
             json_agg(DISTINCT jsonb_build_object('id', i2.id, 'url', i2.url, 'order', ii.order)) as images,
             jsonb_build_object('id', u.id, 'name', u.name, 'email', u.email) as seller
      FROM inventories i
               LEFT JOIN inventory_tag it ON i.id = it.inventory_id
               LEFT JOIN inventory_size i_s on i.id = i_s.inventory_id
               LEFT JOIN sizes s ON i_s.size_id = s.id
               LEFT JOIN measurements m ON s.measurement_id = m.id
               LEFT JOIN physiques p ON m.physique_id = p.id
               LEFT JOIN tags t on it.tag_id = t.id
               LEFT JOIN tags t2 on i.brand_id = t2.id
               LEFT JOIN inventory_text it2 on i.id = it2.inventory_id
               LEFT JOIN users u on i.seller_id = u.id
               LEFT JOIN image_inventory ii on ii.inventory_id = i.id
               LEFT JOIN images i2 on i2.id = ii.image_id`;
      let idx = 1; let whereClauses = []; let args = [];
      const addWhereClauses = (clause, arg) => {
        whereClauses.push(clause);
        args.push(arg);
        idx ++
      };

      const addCustomClauses = (clause, arg) => {
        query += (clause);
        args.push(arg);
        idx++
      };

      if('tags' in filter && filter.tags.length > 0){
          addWhereClauses(`it.tag_id = ANY($${idx}::INT[])`, filter.tags);
      }
      if('minPrice' in filter){
        addWhereClauses(`i.price > $${idx}`, filter.minPrice);
      }
      if('maxPrice' in filter){
        addWhereClauses(`i.price < $${idx}`, filter.maxPrice);
      }
      if('sizes' in filter && filter.sizes.length > 0){
        addWhereClauses(`iz.size_id = ANY($${idx}::STRING[])`, filter.sizes);
      }
      if(whereClauses.length !== 0){
        query += ` WHERE ${whereClauses.join(' AND ')}`;
      }
      let pageSize = 30;
      query += ' GROUP BY i.id, t2.name, u.id, u.name, u.email, i.price ';
      query += `LIMIT ${pageSize} `;
      if('page' in filter){
        query += addCustomClauses(` OFFSET (${idx}*${pageSize})`, filter.page);
      }

      const inventories = (await qNonEmpty(query, args)).rows;

      logger.info(JSON.stringify(inventories), '%o');
      console.log(inventories);

      return res.json({status: 200, data: inventories})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),
/*
  id
  name
  brand
  price
  tags: {
    id
    name
  }
  sizes: {
    id
    name
  }
  text: {
    language
    name
    description
    id
  }
  images: {
    id
    url
    order
  }
  seller: {
    id
    name
    email
  }


 */

  get: asyncRoute(async (req, res) => {
    try {
      const inventory = (await qNonEmpty(
          `SELECT i.id, i.brand, i.price, json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 
    'aspect', a.name )) as tags,
                  json_agg(DISTINCT jsonb_build_object('id', s.id, 'name', s.name, 'measurement_id', m.id, 'measurement_name', m.name,
                                                       'physique_id', p.id, 'physique_name', p.name)) as sizes,
                  json_agg(DISTINCT jsonb_build_object('id', it2.id, 'name', it2.name, 'description', it2.description,
                                                       'language', it2.language)) as text,
                  json_agg(DISTINCT jsonb_build_object('url', ii.url, 'order', ii.item_order)) as images,
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
           WHERE i.id = $1 GROUP BY i.id, i.brand, u.id, u.name, u.email, i.price;`, [req.params.id])
      ).rows[0];
      return res.json({status: 200, data: inventory})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  create: asyncRoute(async (req, res) => {

    const data =  JSON.parse(req.body.data);
    const { sellerId, tags, brandId, sizes, text
    } = data;

    const { files } = req;
    const imageUrlList = files.length > 0 ? files
      .filter( f => 'location' in f)
      .map(f => f.location) : [];

    let inventory;
    try {
      await p.tx(async client => {
        inventory = (await client.query(
            `INSERT INTO inventories (seller_id, brand_id) values ($1, $2) returning id;`,
            [sellerId, brandId])
        ).rows[0];
        let inventoryId = inventory.id;

        const { placeHoldersString : sizePlaceHolders,
          arrayParameters : sizeParameters} = makeQuery(sizes, inventoryId);

        await client.query(`INSERT INTO inventory_size (inventory_id, size_id) values ${sizePlaceHolders}`,
          sizeParameters);

        const { placeHoldersString : tagPlaceHolders,
          arrayParameters :tagParameters} = makeQuery(tags, inventoryId);

        await client.query(`INSERT INTO inventory_tag (inventory_id, tag_id) values ${tagPlaceHolders}`,
          tagParameters);

        let imgPlaceHolders = `(${imageUrlList.map((v, i) => `$${i+1}`).join(', ')})`;
        const idList = (await client.query(`INSERT INTO images (url) 
            values ${imgPlaceHolders} RETURNING id`,
          imageUrlList)).rows;

        const { placeHoldersString : imgInvPlaceHolders,
          arrayParameters :imgInvParameters} = makeQuery(idList, inventoryId);

        await client.query(`INSERT INTO image_inventory (inventory_id, image_id) values ${imgInvPlaceHolders}`,
          imgInvParameters);

        let textPlaceHoldersArray = [];
        let textParameters = [];
        text.map((k, i) => {
          textPlaceHoldersArray.push(`($${i*4 + 1}, $${i*4 + 2}, $${i*4 + 3}, $${i*4 + 4})`);
          textParameters.push(inventoryId);
          textParameters.push(k.language);
          textParameters.push(k.name);
          textParameters.push(k.description);
        });
        let textPlaceHoldersString = textPlaceHoldersArray.join(', ');


        await client.query(`INSERT INTO inventory_text (inventory_id, language, name, description) 
            values ${textPlaceHoldersString}`,
          textParameters)
      });

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
