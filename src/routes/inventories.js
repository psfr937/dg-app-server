import inventories from '../controllers/inventories';
import {jwtAuth} from "../middlewares/jwtAuth";
import upload from "../utils/s3/uploadFileToS3";


export default app => {
  app.get('/api/inventories', inventories.list);
  app.get('/api/inventories/:id', inventories.get);
};
