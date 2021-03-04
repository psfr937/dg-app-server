import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";
import logger from '../utils/logger'

export default {
  list: asyncRoute(async (req, res) => {
    try {
      const questions = (await qNonEmpty(
          `SELECT * FROM tags WHERE c`)
      ).rows
      return res.json({status: 200, data: questions})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  listOneCategory: asyncRoute(async (req, res) => {

    const {files, body} = req;

    logger.info(body, '%o')

    let createList = JSON.parse(body.createList);
    let updateList = JSON.parse(body.updateList);
    let deleteList = JSON.parse(body.deleteList);

    logger.info(createList);

    const imageUrlList = files.length > 0 ? files
      .filter(f => 'location' in f)
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

      if (createListIndex >= 0) {
        createList[createListIndex].picture_url = i.picture_url
      } else {
        let updateListIndex = updateList.findIndex(u => u.id === id)
        if (updateListIndex >= 0) {
          updateList[updateListIndex].picture_url = i.picture_url
        }
      }
    })
  })

}
