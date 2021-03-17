import algoliaController from '../controllers/algolia'

export default app => {
  app.get('/algolia/insert-all', algoliaController.insertAll);
  app.get('/algolia/setting', algoliaController.setting);
  app.get('/algolia/clear', algoliaController.clearObjects)
};
