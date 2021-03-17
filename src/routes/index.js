
import ping from './ping'
import users from "./users";
import plans from "./plans";
import stripe from "./stripe";
import packListTypes from "./packListTypes"
import inventories from "./inventories";
import cart from './cart'
import quotation from './quotation'
import addresses from './addresses'
import transaction from "./transaction";
import bagTypes from "./bagTypes";
import sizes from './sizes';
import tags from './tags';
import algolia from "./algolia";

export default app => {
  users(app);
  ping(app);
  plans(app);
  stripe(app);
  transaction(app);
  packListTypes(app);
  inventories(app);
  cart(app);
  quotation(app);
  addresses(app);
  bagTypes(app);
  sizes(app);
  tags(app);
  algolia(app);
};
