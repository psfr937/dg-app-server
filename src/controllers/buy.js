import Errors from "../constants/Errors";
import asyncRoute from "../utils/asyncRoute";
import logger from "../utils/logger";
import p from "../utils/agents"
import { placeDeliveryOrder } from "./delivery";
import { confirmedPaymentIntent } from "./billing/confirmedPay";
import { q, qNonEmpty } from "../utils/q";
import {getLastQuotation} from "./transaction";


