import inventories from '../controllers/inventories';
import {jwtAuth} from "../middlewares/jwtAuth";
import upload from "../utils/s3/uploadFileToS3";
import bodyParser from "../middlewares/bodyParser";


export default app => {
  app.post('/inventories/list', bodyParser.json, inventories.list);
  app.get('/inventories/:id', inventories.get);
};
