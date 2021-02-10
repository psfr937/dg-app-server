import mountStore from "./mountStore";
import errorHandler from "./errorHandler";
import passportInit from './passportInit';
import cors from 'cors'

export default app => {

  app.use('*', cors({
    "origin": "http://localhost:3000",
    "credentials": true
  }));

  app.use(mountStore);
  app.use(errorHandler);
  app.use(passportInit);
};
