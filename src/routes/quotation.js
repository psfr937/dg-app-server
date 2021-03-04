import { jwtAuth } from '../middlewares/jwtAuth';
import bodyParser from "../middlewares/bodyParser";
import { saveAddress, getQuotation} from "../controllers/quotation"

export default app => {
  app.post('/quotation/buy',
    jwtAuth,
    bodyParser.json,
    saveAddress,
    getQuotation('buy')
  );
  app.post('/quotation/sell',
    jwtAuth,
    bodyParser.json,
    saveAddress,
    getQuotation('sell')
  );
};
