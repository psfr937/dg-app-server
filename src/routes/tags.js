import tagController from "../controllers/tags"

export default app => {
  app.get('/tags',
    tagController.list
  )
};
