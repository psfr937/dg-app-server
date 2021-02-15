import serviceController from '../controllers/inventories';
import {jwtAuth} from "../middlewares/jwtAuth";
import upload from "../utils/s3/uploadFileToS3";


export default app => {
  app.post('/api/inventories', jwtAuth, upload.any(), serviceController.update);
  app.get('/api/inventories', serviceController.list);

};
