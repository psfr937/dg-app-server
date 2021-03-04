import bagTypesController from '../controllers/bagTypes';


export default app => {
  app.get('/bag-types', bagTypesController.list);
};
