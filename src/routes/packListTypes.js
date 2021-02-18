import packListTypesController from '../controllers/packListTypes';


export default app => {
  app.get('/api/pack-list-types', packListTypesController.list);
};
