import questionController from '../controllers/questions';
import {jwtAuth} from "../middlewares/jwtAuth";
import { rankPermission } from '../middlewares/validate'
import rights from '../constants/Rights'
import upload from "../utils/s3/uploadFileToS3";

export default app => {
  app.post('/api/questions', jwtAuth, rankPermission(rights.UPDATE_QUESTIONS), upload.any(), questionController.update);
  app.get('/api/questions', questionController.list);
};
