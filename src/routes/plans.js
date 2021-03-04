import planController from "../controllers/plans"
import { jwtAuth } from '../middlewares/jwtAuth';
export default app => {
  app.get('/plans',
    jwtAuth,
    planController.list);
};
