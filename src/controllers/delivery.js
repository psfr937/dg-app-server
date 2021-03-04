import logger from "../utils/logger";
import Errors from "../constants/Errors";
import axios from 'axios'
const fetchToken = async () => {
  const options = {
    method: 'POST',
    url: 'https://stag-hk-api.gogox.com/oauth/token',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    data:{
      grant_type: 'client_credentials',
      client_id: '864cb2157543b72bd15f8d98ce434ffdd93a1b7e8630a83204edb871d14a7642',
      client_secret: '3bd2830f93452bbc2a2d71c78c3a67bbfffc05892b09132814171207786e79be'
    }
  };

  try{
    return await axios(options);

  } catch(err){
    if (err.response) {
      logger.error(err.response, '%o');
      console.log(err.response.status);
    }
    throw err
  }
};


export const getTransportQuotation = async (vehicle_type, schedule_at, from, to) => {

  let token;
  try{
    const tokenResult = await fetchToken();
    token = tokenResult.access_token
  }catch(err){
    throw err
  }



  const options = {
    method: 'POST',
    url: 'https://stag-hk-api.gogox.com/transport/quotations',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      payment_method: 'monthly_settlement',
      vehicle_type: vehicle_type,
      pickup: {
        schedule_at: schedule_at,
        location: {
          lat: from.lat,
          lng: from.lng
        }
      },
      destinations: {
        location: {
          lat: to.lat,
          lng: to.lng
        }
      }
    }
  };

  try {
    return await axios(options)
  } catch (err) {
    throw err
  }
};

// {
//   "access_token":"72f180d31689738c5593bfa8dde321ed6b85bad4f528603246fb12b70ba92aa9"
//   "token_type":"Bearer"
//   "expires_in":7200
//   "created_at":1614249382
// }

export const placeTransportOrder = async (vehicle_type, schedule_at, from, to) => {

  let token;
  try{
    const tokenResult = await fetchToken();
    token = tokenResult.access_token
  }catch(err){
    throw err
  }



  const options = {
    method: 'POST',
    url: 'https://stag-hk-api.gogox.com/transport/orders',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      payment_method: 'monthly_settlement',
      vehicle_type: vehicle_type,
      pickup: {
        schedule_at: schedule_at,
        location: {
          lat: from.lat,
          lng: from.lng
        }
      },
      destinations: {
        location: {
          lat: to.lat,
          lng: to.lng
        }
      }
    }
  };

  try {
    return await axios(options)

  } catch (err) {
    throw err
  }
};



export const getDeliveryQuotation = async (delivery_type, schedule_at, from, to) => {

  let token;
  try {
    let tokenResult = await fetchToken();
    token = tokenResult.data.access_token;
  }
  catch(err){
    logger.error(JSON.stringify(err), '%o');
    throw err
  }


  const options = {
    method: 'POST',
    url: 'https://stag-hk-api.gogox.com/delivery/quotations',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data: {
      package: {weight: 1, height: 60, length: 60, width: 60},
      pickup: { location: from, schedule_at: schedule_at },
      destinations: [{
        location: to
      }],
      delivery_type: delivery_type
    }
  };

  try {
    return await axios(options);
  } catch (err) {
    logger.error(JSON.stringify(err), '%o');
    throw err
  }
};



export const placeDeliveryOrder = async (deliveryType, scheduleAt, from, to) => {

  let token;
  try {
    let tokenResult = await fetchToken();
    token = tokenResult.data.access_token;
  }
  catch(err){
    throw err
  }

  logger.info(token, '%o');

  console.log(from);
  console.log(to);

  const options = {
    method: 'POST',
    url: 'https://stag-hk-api.gogox.com/delivery/orders',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    data:{
      package: {
        content: 'clothes',
        weight: 1,
        height: 60,
        length: 60,
        width: 60
      },
      pickup: {
        location: {
          lat: from.lat,
          lng: from.lng
        },
        contact: {
          name: from.recipientName,
          phone_number: from.recipientPhone
        },
        street_address: from.lineTwo,
        schedule_at: scheduleAt,
        floor_or_unit_number: from.lineOne,
      }, destinations: [ {
        location: {lat: to.lat, lng: to.lng},
        contact: {
          name: to.recipientName,
          phone_number: to.recipientPhone
        },
        street_address: to.lineTwo,
        floor_or_unit_number: to.lineOne
      }
      ],
      delivery_type: deliveryType,
      payment_method: 'prepaid_wallet',
      merchant_order_number: '1',
      note_to_courier: 'haha'
    }
  };

  try {
    return await axios(options);

  } catch (err) {
    throw err
  }
};



