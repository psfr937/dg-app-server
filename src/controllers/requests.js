import buildQuery from "./buildQuery/regular";
import logger from '../utils/logger'
import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import buildTxQuery from './buildQuery/tx'
import p from "../utils/agents";
import stripe from "../utils/stripe";

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const requests = (await qNonEmpty(
          `SELECT *
           FROM requests`)
      ).rows
      return res.json({status: 200, data: requests})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  create: asyncRoute( async (req, res) => {
    const { files, body } = req

    logger.info(body, '%o')

    let createList =  JSON.parse(body.createList)
    let updateList = JSON.parse(body.updateList)
    let deleteList = JSON.parse(body.deleteList)

    logger.info(createList)

    const tableName = 'requests';

    try{
      await p.tx(async client => {
        await qNonEmpty(`INSERT INTO requests () VALUES $1, $2)`,

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

    const requests = (await q(`SELECT * FROM requests ORDER BY id`)).rows
    return res.json({status: 200, data: requests})
  }),


}
