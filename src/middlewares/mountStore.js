import { createStore } from 'redux';
import rootReducer from '../reducers';

export default (req, res, next) => {
  req.store = createStore(rootReducer);
  next();
};
