'use strict';


module.exports.newMoltinOrder = async (event, context) => {
  const request = require('request');

  // bas64 for Ordoro auth
  const userpass = "username" + ":" + "password";  
  let buff = new Buffer(userpass);  
  let base64auth = buff.toString('base64')
  
  // parse webhook  
  let eventBody = JSON.parse(event.body);
  let moltinOrderBody = JSON.parse(eventBody.resources).data
  let includedItems = JSON.parse(eventBody.resources).included.items
  let createOrderBody = {"order_id": moltinOrderBody.id, "billing_address": moltinOrderBody.billing_address, "shipping_address": moltinOrderBody.shipping_address, "lines": includedItems}

  // build request for creating order in Ordoro
  let options = {
    uri: '  https://api.ordoro.com/order/',
    headers: {'Authorization': "Basic  " + base64auth},
    method: 'POST',
    json: createOrderBody
  };

  // make request to Ordoro
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body)
    } else if(error) {
      console.log(error)
    } else {
      console.log(response)
    }
  });

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  };

};
