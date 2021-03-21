import inventories from '../controllers/inventories';
import upload from "../utils/s3/uploadFileToS3";
import bodyParser from "../middlewares/bodyParser";
import updateInv from "../controllers/updateInventory";
import algolia from "../controllers/algolia";

export default app => {
  app.get('/inventories/:id', inventories.get);

  app.post('/inventories/add',
    upload.any(),
    updateInv.extractAndInsertInfo,
    updateInv.updateTexts,
    updateInv.updateTags,
    updateInv.updateSizes,
    updateInv.changeOrAddImages,
    algolia.upsert
  );

  app.post('/inventories/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.updateInfo,
    updateInv.updateTexts,
    updateInv.updateTags,
    updateInv.updateSizes,
    updateInv.removeImages,
    updateInv.changeOrAddImages,
    algolia.upsert
  );

  app.post('/inventories/update-tags/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.updateTags
  );

  app.post('/inventories/update-sizes/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.updateSizes
  );

  app.post('/inventories/change-or-add-images/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.changeOrAddImages
  );

  app.post('/inventories/remove-images/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.removeImages
  );

  app.post('/inventories/arrange-images/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.arrangeImages
  );

  app.post('/inventories/update-info/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.updateInfo
  );

  app.post('/inventories/update-texts/:id',
    upload.any(),
    updateInv.extractInfo,
    updateInv.updateTexts
  );

};
