
import logger from '../utils/logger'
import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import buildTxQuery from './buildQuery/tx'
import p from "../utils/agents";
export default {
  list: asyncRoute(async (req, res) => {
    try {
      console.log(req);
      const inventories = (await qNonEmpty(
          `SELECT *
           FROM inventories`)
      ).rows;
      logger.info(JSON.stringify(inventories), '%o');
      console.log(inventories);
      return res.json({status: 200, data: inventories})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  get: asyncRoute(async (req, res) => {
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

  create: asyncRoute( async (req, res) => {
    const { files, body } = req

    logger.info(body, '%o')

    let createList =  JSON.parse(body.createList);
    let updateList = JSON.parse(body.updateList);
    let deleteList = JSON.parse(body.deleteList);

    logger.info(createList)

    const imageUrlList = files.length > 0 ? files
      .filter( f => 'location' in f)
      .map(f => {
        console.log(f)
        let splitting = f.metadata.fieldName.split('image_')
        return {
          picture_url: f.location,
          id: parseInt(splitting[1]),
        }
      }) : []

    imageUrlList.map(i => {
      console.log(i.id)
      const id = i.id
      let createListIndex = createList.findIndex(c => c.id === id)

      if(createListIndex >= 0){
        createList[createListIndex].picture_url = i.picture_url
      }
      else{
        let updateListIndex = updateList.findIndex(u => u.id === id)
        if(updateListIndex >= 0) {
          updateList[updateListIndex].picture_url = i.picture_url
        }
      }
    });

    const tableName = 'inventories'

    const fieldNameArray = {
      insert: [
        {name: 'name', type: 'TEXT'},
        {name: 'picture_url', type: 'TEXT'},
        {name: 'description', type: "TEXT"},
        {name: 'price', type: "INTEGER"},
        {name: 'minutes_required', type: "INTEGER"}
      ],
      update: [
        {name: 'id', type: 'INTEGER'},
        {name: 'name', type: 'TEXT'},
        {name: 'picture_url', type: 'TEXT'},
        {name: 'description', type: "TEXT"},
        {name: 'price', type: "INTEGER"},
        {name: 'minutes_required', type: "INTEGER"}
      ],
      delete: [
        {name: 'id', type: 'INTEGER'},
        {name: 'removed', type: 'BOOLEAN'}
      ]
    }

    try{
      await p.tx(async client => {
        await buildTxQuery(
          tableName,
          [{
            list: createList,
            fieldName: fieldNameArray.insert,
            mode: 'INSERT'
          }]
        );


        await buildTxQuery(
          tableName,
          [{
            list: updateList,
            fieldName: fieldNameArray.update,
            mode: 'UPDATE'
          }]
        )
      })
    }
    catch(errs){
      console.log(errs)
      res.errors([Errors.UNEXPECTED_ERROR])
    }

    const inventories = (await q(`SELECT * FROM inventories ORDER BY id`)).rows
    return res.json({status: 200, data: inventories})
  }),


}
