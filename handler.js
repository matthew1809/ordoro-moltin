'use strict';

const helpers = require('./helpers')

module.exports.newMoltinOrder = async (event, context) => {
  // parse webhook  
  let eventBody = JSON.parse(event.body);
  let moltinOrderBody = JSON.parse(eventBody.resources).data
  let items = JSON.parse(eventBody.resources).included.items

  // transform data to Ordoro formatting
  let lines = await helpers.parseLineItems(items)
  let shipping = helpers.parseAddress(moltinOrderBody.shipping_address)
  let billing = helpers.parseAddress(moltinOrderBody.billing_address)
  let createOrdoroOrderBody = {"order_id": moltinOrderBody.id, "billing_address": billing, "shipping_address": shipping, "lines": lines}

  // make Ordoro request
  try {
    helpers.createOrdoroOrder(createOrdoroOrderBody)
    return helpers.responseBuilder(response.statusCode, 'all good')
  } catch(e) {
    return helpers.responseBuilder(500, 'not good')
  }
};

module.exports.syncShipmentStatus = async (event, context) => {
  try {
    await helpers.processAllUnshippedOrders()
    return helpers.responseBuilder(200, 'all good')
  } catch(e) {
    return helpers.responseBuilder(500, JSON.stringify(e)) 
  }
}
