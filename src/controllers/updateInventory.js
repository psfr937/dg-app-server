
import asyncRoute from "../utils/asyncRoute";
import {q, qNonEmpty} from "../utils/q";
import Errors from "../constants/Errors";

/*
       {
          price: $30000,
          text: [{
            language: ''
            description: '',
            productName: '',
          }],
          image: {
           upsert: [{
              order: 2
              url: ''
          }],
          insert: [{
              order: 4
              url: ''
          }],
          arrange: [{
              order: 3
              url: ''
          }],
          delete: [ 3 ] //list of item_order
        },
        tags: [{
          insert: [ 2 ] //tagId array
          remove [ 3 ] //tagId array
        }],
        sizes: [{
          insert: [ 2 ] //sizeId array
          remove [ 3 ] //sizeId array
        },
     }
 */

export default {
  updateTags: asyncRoute(async (req, res, next) => {
    const {tags, inventoryId} = req.data;

    try {
      if(tags.insert.length > 0) {
        const makeQuery = (list, inventoryId) => {
          let placeHoldersArray = [];
          let arrayParameters = [];
          list.map((k, i) => {
            placeHoldersArray.push(`($${i * 2 + 1}, $${i * 2 + 2})`);
            arrayParameters.push(k);
            arrayParameters.push(inventoryId);
          });
          let placeHoldersString = placeHoldersArray.join(', ');
          return {
            placeHoldersString,
            arrayParameters
          }
        };

        const {
          placeHoldersString: tagPlaceHolders,
          arrayParameters: tagParameters
        } = makeQuery(tags.insert, inventoryId);
        console.log(tagParameters)
        await q(`INSERT INTO inventory_tag (tag_id, inventory_id) VALUES ${tagPlaceHolders}`,
          tagParameters);
      }
      if(tags.remove.length > 0) {
        await q(`DELETE
                 FROM inventory_tag
                 WHERE inventory_id = $1
                   AND tag_id = ANY ($2::INT[])`,
          [inventoryId, tags.remove]);
      }
      // if (typeof next != "undefined") {
      //   return next()
      // }
      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      console.log(err)
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  updateSizes: asyncRoute(async (req, res, next) => {
    try {
      const {sizes, inventoryId} = req.data;
      if(sizes.insert.length > 0) {
        const makeQuery = (list, inventoryId) => {
          let placeHoldersArray = [];
          let arrayParameters = [];
          list.map((k, i) => {
            placeHoldersArray.push(`($${i * 2 + 1}, $${i * 2 + 2})`);
            arrayParameters.push(k);
            arrayParameters.push(inventoryId);
          });
          let placeHoldersString = placeHoldersArray.join(', ');
          return {
            placeHoldersString,
            arrayParameters
          }
        };


        const {
          placeHoldersString: sizePlaceHolders,
          arrayParameters: sizeParameters
        } = makeQuery(sizes.insert, inventoryId);

        await q(`INSERT INTO inventory_size (size_id, inventory_id) 
        values ${sizePlaceHolders} ON CONFLICT DO NOTHING`,
          sizeParameters);
      }

      if(sizes.remove.length > 0) {
        await q(`DELETE
                 FROM inventory_size
                 WHERE inventory_id = $1
                   AND size_id = ANY ($2::INT[])`,
          [inventoryId, sizes.remove]);
      }

      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  updateTexts: asyncRoute(async (req, res, next) => {
    try {
      const {texts, inventoryId} = req.data;
      let textPlaceHoldersArray = [];
      let textParameters = [];
      texts.map((k, i) => {
        textPlaceHoldersArray.push(`($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`);
        textParameters.push(inventoryId);
        textParameters.push(k.language);
        textParameters.push(k.name);
        textParameters.push(k.description);
      });
      let textPlaceHoldersString = textPlaceHoldersArray.join(', ');

      await q(`INSERT INTO inventory_text (inventory_id, language, name, description) 
            values ${textPlaceHoldersString} ON CONFLICT (inventory_id, "language") DO UPDATE SET 
            name = excluded.name,
            description = excluded.description`,
          textParameters);


      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      console.log(err)
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  updateInfo: asyncRoute(async (req, res, next) => {
    try {
      const { inventoryId, sellerId, brand, price } = req.data;
      q(`UPDATE inventories
         SET seller_id = $1, brand = $2, price = $3
         WHERE id = $4;`,
        [sellerId, brand, price, inventoryId]);

      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  extractInfo: (req, res, next) => {
    req.data =  JSON.parse(req.body.data);
    req.data.inventoryId = parseInt(req.params.id);
    console.log(req.data)
    return next()
  },

  removeImages: asyncRoute( async(req, res, next) => {
    try{
      const { images, inventoryId } = req.data;
      const { remove: removeList } = images;

      /* REMOVE LIST*/
      if(removeList.length > 0) {
        await q(`DELETE
                 FROM image_inventory
                 WHERE inventory_id = $1
                   AND item_order = ANY ($2::INT[])`,
          [inventoryId, removeList]);
      }

      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  arrangeImages: asyncRoute( async(req, res, next) => {
    try{
      const { images, inventoryId } = req.data;
      const { arrange: arrangeList } = images;

      const makeQuery = (list, inventoryId) => {
        let placeHoldersArray = [];
        let arrayParameters = [];
        list.map((k, i) => {
          placeHoldersArray.push(`($${i*2 + 1}, $${i*2 + 2}, $${i*2 + 3})`);
          arrayParameters.push(inventoryId);
          arrayParameters.push(k.order);
          arrayParameters.push(k.url);
        });
        let placeHoldersString = placeHoldersArray.join(', ');
        return {
          placeHoldersString,
          arrayParameters
        }
      };

      const {
        placeHoldersString: imgInvPlaceHolders,
        arrayParameters: imgInvParameters
      } = makeQuery(arrangeList, inventoryId);

      /* ARRANGE LIST*/
      await q(`INSERT INTO image_inventory (inventory_id, item_order, url) 
        values ${imgInvPlaceHolders} ON CONFLICT (inventory_id, "order") SET 
        url = excluded.url`,
        [inventoryId, arrangeList]);

      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),

  changeOrAddImages: asyncRoute( async(req, res, next) => {

      const { files } = req;
      const { inventoryId } = req.data;
      const appendList = req.data.images.append;
      let changeOrAddList

      console.log(files)

      changeOrAddList = files.length > 0 ? files
        .filter( f => 'location' in f)
        .map(f => {
          let splitting = f.metadata.fieldName.split('image-');
          const info = splitting[1];
          let splitInfo = info.split('-');
          const order = splitInfo[1];
          return {
            url: f.location,
            id: inventoryId,
            order: parseInt(order)
          }
        }) : [];


      const updateList = changeOrAddList;

      /* CHANGE OR ADD LIST*/
    try{
      if(updateList.length > 0) {
        const makeQuery = (list, inventoryId) => {
          let placeHoldersArray = [];
          let arrayParameters = [];
          list.map((k, i) => {
            placeHoldersArray.push(`($${i*2 + 1}, $${i*2 + 2}, $${i*2 + 3})`);
            arrayParameters.push(inventoryId);
            arrayParameters.push(k.order);
            arrayParameters.push(k.url);
          });
          let placeHoldersString = placeHoldersArray.join(', ');
          return {
            placeHoldersString,
            arrayParameters
          }
        };

        const {
          placeHoldersString: imgInvPlaceHolders,
          arrayParameters: imgInvParameters
        } = makeQuery(updateList, inventoryId);

        await q(`INSERT INTO image_inventory (inventory_id, item_order, url) 
        values ${imgInvPlaceHolders} ON CONFLICT (inventory_id, item_order) DO UPDATE SET 
        url = excluded.url`,
          imgInvParameters);
      }

      return res.json({status: 200, data: 'OK'})
    } catch (err) {
      console.log(err)
      return res.errors([Errors.DB_OPERATION_FAIL(err)])
    }
  }),


}
