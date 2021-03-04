import packListTypesController from '../controllers/packListTypes';


export default app => {
  app.get('/pack-list-types', packListTypesController.list);
};
