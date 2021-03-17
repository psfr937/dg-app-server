import sizeController from "../controllers/sizes"

export default app => {
  app.get('/sizes',
    sizeController.list
  )
};
