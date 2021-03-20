import bodyParser from "../middlewares/bodyParser";
import inventories from "../controllers/inventories";

export default app => {
  app.post('/migrate', bodyParser.json, inventories.list)
}