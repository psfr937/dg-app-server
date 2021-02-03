

import clients from "../controllers/clients";
export default app => {
  // user
  app.get('/api/clients', clients.list);
};
