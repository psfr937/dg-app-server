import axios from "axios";

import asyncRoute from "../utils/asyncRoute";
import { q, qNonEmpty } from "../utils/q";
import Errors from "../constants/Errors";
import logger from "../utils/logger";
import config from '../config/index'
import p from "../utils/agents";
import {getDeliveryQuotation} from "./delivery";

export const saveAddress = asyncRoute(async (req, res, next) => {
  const { address } = req.body;
    if(typeof address === 'object') {
      const {lineOne, lineTwo, city, province, zip, country} = address;
      const combinedAddressQuery = encodeURI([lineOne, lineTwo, city, province, zip, country]
        .join(' '));

      logger.info(JSON.stringify(combinedAddressQuery), '%o');
      let geolocationResponse = null;
      let lat = null;
      let lng = null;

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
      req.clientAddress = {
        geocode: {
          lat: location.lat,
          lng: location.lng
        },
        ...address
      };

      req.clientAddressFormatted = geolocationResponse
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
              province, zip, country, lat, lng, req.clientAddressFormatted,
              zip
            ])).rows;
            if (addressIdRows.length === 0) {
              throw new Error("Insert Failed")
            }
            else{
              req.addressId = addressIdRows[0].id
            }

            console.log('haha');

            await client.query(`INSERT INTO default_address (user_id , address_id )
              VALUES ($1::INTEGER, $2::INTEGER) ON CONFLICT (user_id, address_id) DO NOTHING`,
              [req.user.id, req.addressId]);
          }
        );
      } catch (err) {
        console.log(err);
        logger.error(JSON.stringify(err), '%o');
        res.pushError([Errors.DB_OPERATION_FAIL(err)]);
        return res.errors()
      }
    }
    else{
      let addressResult;
      try
      {
        addressResult = (await qNonEmpty(
            `SELECT * FROM addresses WHERE id = $1`, [req.body.addressId]
        )).rows[0];
      }
      catch (err) {
        console.log(err);
        logger.error(JSON.stringify(err), '%o');
        res.pushError([Errors.DB_OPERATION_FAIL(err)]);
        return res.errors()
      }

      req.clientAddress = {
        geocode: {
          lat: addressResult.lat,
          lng: addressResult.lng,
        },
        ...addressResult
      };
      req.addressId = addressResult.id;
      req.clientAddressFormatted = addressResult.formatted
    }
    return next()
  });

export const getQuotation = type => asyncRoute(async (req, res, next) => {

    const { addressId, clientAddress, clientAddressFormatted} = req;
    let hqAddress;
    try{
      const hqAddressResult = (await qNonEmpty(
        `SELECT * FROM apps WHERE id = 1`, []
      )).rows[0];

      hqAddress = {
        geocode: {
          lat: hqAddressResult.lat,
          lng: hqAddressResult.lng
        },
        ...hqAddressResult
      }
    }catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors()
    }


    let quotationResult = null;
    let quotation = null;
    let from; let to; let deliveryType;
    const { year, month, date, hours, minutes } = req.body.pickupTime;
    const scheduledTime = Date.UTC(year, month-1, date, hours, minutes) / 1000;
  let quotationId = null;
  try{
      if(type === 'sell'){
        from = clientAddress;
        to = hqAddress;
        deliveryType = 'same_day_night'
      }
      else{
        from = hqAddress;
        to = clientAddress;
        deliveryType = 'same_day_night'
      }
      quotationResult = await getDeliveryQuotation(deliveryType, scheduledTime, from.geocode, to.geocode);
      quotation = {
        provider: 'gogox',
        currency: quotationResult.data.estimated_total_price.currency,
        amount: quotationResult.data.estimated_total_price.amount,
        deliveryType: quotationResult.data.delivery_type,
        estimatedDropOffAt: quotationResult.data.destinations.estimated_dropoff_at,
        location: quotationResult.data.destinations.location,
        package: quotationResult.data.package
      };
    }
    catch(err){
      logger.error(JSON.stringify(err), '%o');
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors()
      quotation = {
        provider: 'gogox',
        currency: 'HKD',
        amount: 60,
        deliveryType: 'same_day_night',
        estimatedDropOffAt: null,
        location: null,
        package: null
      }
    }

    try{
      const attributes = [
        {key: 'user_id', type: 'INTEGER', value: req.user.id},
        {key: 'delivery_cost', type: 'INTEGER', value: quotation.amount},
        {key: 'from_lat', type: 'FLOAT', value: from.geocode.lat},
        {key: 'from_lng', type: 'FLOAT', value: from.geocode.lng},
        {key: 'from_phone', type: 'TEXT', value: from.recipient_phone},
        {key: 'from_name', type: 'TEXT', value: from.recipient_name},
        {key: 'from_line_one', type: 'TEXT', value: from.line_one},
        {key: 'from_line_two', type: 'TEXT', value: from.line_two},
        {key: 'from_formatted', type: 'TEXT', value: from.formatted},
        {key: 'to_lat', type: 'FLOAT', value: to.geocode.lat},
        {key: 'to_lng', type: 'FLOAT', value: to.geocode.lng},
        {key: 'to_phone', type: 'TEXT', value: to.recipient_phone},
        {key: 'to_name', type: 'TEXT', value: to.recipient_name},
        {key: 'to_line_one', type: 'TEXT', value: to.line_one},
        {key: 'to_line_two', type: 'TEXT', value: to.line_two},
        {key: 'to_formatted', type: 'TEXT', value: to.formatted},
        {key: 'schedule_at', type: 'INTEGER', value: scheduledTime},
        {key: 'delivery_type', type: 'TEXT', value: deliveryType},
        {key: 'weight', type: 'INTEGER', value: 1},
        {key: 'height', type: 'INTEGER', value: 60},
        {key: 'length', type: 'INTEGER', value: 60},
        {key: 'width', type: 'INTEGER', value: 60},
      ];

      let placeHolderStringArray = [];
      let fieldNameStringArray = [];
      let argumentArray = [];

      attributes.map((a, i) => {
        placeHolderStringArray.push(`$${i+1}::${a.type}`);
        fieldNameStringArray.push(a.key);
        argumentArray.push(a.value);
      });
      const fieldNameString = fieldNameStringArray.join(', ');
      const placeHolderString = placeHolderStringArray.join(', ');

      quotationId = (await q(`INSERT INTO quotations (${fieldNameString}) VALUES (${placeHolderString}) RETURNING id`,
        argumentArray)).rows[0].id
    }
    catch(err) {
      logger.error(JSON.stringify(err), '%o');
      console.log(err)
      res.pushError([Errors.DB_OPERATION_FAIL(err)]);
      return res.errors()
    }

    return res.status(200).json({
      status: 200,
      data: {
        address: {
          id: addressId,
          lat: clientAddress.geocode.lat,
          lng: clientAddress.geocode.lng,
          formatted: clientAddressFormatted
        },
        quotation: quotation,
        quotationId
      }
    })
  });


