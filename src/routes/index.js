
import ping from './ping'
import users from "./users";
import plans from "./plans";
import payments from "./payments";

export default app => {
  users(app)
  ping(app)
  plans(app)
  payments(app)

};
