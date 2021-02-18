import asyncRoute from "../utils/asyncRoute";

const fetch = require('node-fetch');




export const fetchToken = async () => {

  const url = 'https://stag-hk-api.gogox.com/oauth/token';

  const options = {
    method: 'POST',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'}
  };

  try{
    const res = await fetch(url, options)
    return await res.json()

  } catch(err){
    throw err
  }
}


export const getQuotation = async(vehicle_type, schedule_at, from, to) => {

  const fetch = require('node-fetch');

  const url = 'https://stag-hk-api.gogox.com/transport/orders';

  const options = {
    method: 'POST',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify({
      vehicle_type: vehicle_type,
      schedule_at: schedule_at,
      location: {
        lat: from.lat,
        lng: from.lng
      },
      destinations: {
        lat: from.lat,
        lng: from.lng
      }
    })
  };

  try{
    const res = await fetch(url, options)
    return await res.json()

  } catch(err){
    throw err
  }
}

export const placeOrder = async () => {
  const url = 'https://stag-hk-api.gogox.com/transport/orders';

  const options = {
    method: 'POST',
    headers: {Accept: 'application/json', 'Content-Type': 'application/json'},
    body: JSON.stringify({
      payment_method: 'monthly_settlement'
    })
  };

  fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error('error:' + err));
}





