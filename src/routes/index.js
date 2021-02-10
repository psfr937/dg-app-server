
import ping from './ping'
import users from "./users";

export default app => {
  users(app)
  ping(app)

};
