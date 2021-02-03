import errorHandler from "./errorHandler";

export default app => {
  app.use(errorHandler);
};
