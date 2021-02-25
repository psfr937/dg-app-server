import cart from '../controllers/cart';
import bodyParser from "../middlewares/bodyParser";

export default app => {
  app.post('/api/cart', bodyParser.json, cart.list);
};
