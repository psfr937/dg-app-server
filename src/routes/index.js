
import ping from './ping'
import clients from "./clients";

export default app => {
  clients(app)
  ping(app)

};
