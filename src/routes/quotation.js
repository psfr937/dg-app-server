import { jwtAuth } from '../middlewares/jwtAuth';
import bodyParser from "../middlewares/bodyParser";
import quotation from "../controllers/quotation"

export default app => {
  app.post('/api/delivery/get-quotation',
    jwtAuth,
    bodyParser.json,
    quotation.getQuotation
  );
};
