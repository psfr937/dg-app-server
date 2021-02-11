import Stripe from 'stripe';
import { stripe as stripeKey} from '../config'
const stripeAPI = new Stripe(stripeKey, {
  apiVersion: '2020-08-27',
});

export default stripeAPI