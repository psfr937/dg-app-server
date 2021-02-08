import mountStore from "./mountStore";
import errorHandler from "./errorHandler";

export default app => {
  app.use(mountStore);
  app.use(errorHandler);
};
