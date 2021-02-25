import { jwtAuth } from '../middlewares/jwtAuth';
import bodyParser from "../middlewares/bodyParser";
import address from "../controllers/address"

export default app => {
  app.get('/api/addresses',
    jwtAuth,
    bodyParser.json,
    address.list
  );
};
