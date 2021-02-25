import axios from "axios";

import asyncRoute from "../utils/asyncRoute";
import { q, qNonEmpty } from "../utils/q";
import Errors from "../constants/Errors";
import logger from "../utils/logger";
import config from '../config/index'
import p from "../utils/agents";
import {getDeliveryQuotation} from "./delivery";

import { deliveryRoutes, itemPropertySources } from "../constants/delivery";

export default {


  getQuotation: asyncRoute(async (req, res) => {
      logger.info(JSON.stringify(req.body.data), '%o');

    const { deliveryRoute } = req.body;
    const { saveAddress } = req.body;
    let addressId;
    let clientAddress;
    let hqAddress;

    try{
      const hqAddressResult = (await qNonEmpty(
        `SELECT lat, lng FROM apps WHERE id = 1`, []
      )).rows[0];

      hqAddress = {
        lat: hqAddressResult.lat,
        lng: hqAddressResult.lng
      }
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)])
      return res.errors()
    }

    if(saveAddress === true) {

      const {lineOne, lineTwo, city, province, zip, country} = req.body.address;
      const combinedAddressQuery = encodeURI([lineOne, lineTwo, city, province, zip, country]
        .join(' '));

      logger.info(JSON.stringify(combinedAddressQuery), '%o');
      let geolocationResponse = null;
      let lat = null;
      let lng = null;
      let formatted = null;
      try {
        const options = {
          method: 'GET',
          url: `https://maps.googleapis.com/maps/api/geocode/json?address=${combinedAddressQuery}&key=${config.googleMapApiKey}`,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          }
        };

        logger.info(JSON.stringify(options.url), '%o');


        geolocationResponse = (await axios(options)).data;

        if(geolocationResponse.status !== 'OK'){
          throw new Error(geolocationResponse.error_message)
        }

      } catch (err) {
        console.log(err);
        logger.error(JSON.stringify(err), '%o');
        res.pushError([Errors.GOOGLE_MAP_ERROR(err)]);
        return res.errors()
      }
      if(geolocationResponse.results.length === 0){
        throw new Error('Invalid Address');
      }
      const location = geolocationResponse.results[0].geometry.location;
      clientAddress = {
        lat: location.lat,
        lng: location.lng
      };
      formatted = geolocationResponse
        .results[0]
        .formatted_address;

      try {
        await p.tx(async client => {
            const addressIdRows = (await client.query(`INSERT INTO addresses 
      (user_id, line_one, line_two, 
        city, province, zip, country, 
        lat, lng, formatted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
              ON CONFLICT (formatted) DO UPDATE SET zip = $11 RETURNING id`, [
              req.user.id, lineOne, lineTwo, city,
              province, zip, country, lat, lng, formatted,
              zip
            ])).rows;
            if (addressIdRows.length === 0) {
              throw new Error("Insert Failed")
            }
            else{
              addressId = addressIdRows[0].id
            }

            console.log('haha');

            await client.query(`INSERT INTO default_address (user_id , address_id )
              VALUES ($1::INTEGER, $2::INTEGER) ON CONFLICT (user_id, address_id) DO NOTHING`,
              [req.user.id, addressId]);
          }
        );
      } catch (err) {
        console.log(err)
        logger.error(JSON.stringify(err), '%o');
        res.pushError([Errors.DB_OPERATION_FAIL(err)]);
        return res.errors()
      }
    }
    else{
      const address = (await qNonEmpty(
        `SELECT lat, lng FROM addresses WHERE addressId = $1`, [req.body.addressId]
      )).rows[0];

      clientAddress = {
        lat: address.lat,
        lng: address.lng
      }
    }

    try{

      const { year, month, date, hours, minutes } = req.body.pickupTime;

      const scheduledTime = Date.UTC(year, month-1, date, hours, minutes) / 1000;

      let from; let to; let deliveryType;
      if(deliveryRoute === deliveryRoutes.FROM_CLIENT_TO_HQ){
        from = clientAddress;
        to = hqAddress;
        deliveryType = 'same_day_night'
      }
      else{
        from = hqAddress;
        to = clientAddress;
        deliveryType = 'same_day_night'
      }
      await getDeliveryQuotation(deliveryType, scheduledTime, from, to)
    }
    catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors()
    }

    if (typeof next != "undefined") {
      return next()
    }
    return res.status(200).json({
      status: 200,
      result: req.body.data
    })
  })
}