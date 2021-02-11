import planController from "../controllers/plans"
import { jwtAuth } from '../middlewares/jwtAuth';
export default app => {
  app.get('/api/plans',
    jwtAuth,
    planController.list);
};
