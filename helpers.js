var exports = module.exports = {};

const request = require('request');

// Moltin client
const { createClient } = require('@moltin/request')
const client = new createClient({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET
})

// base64 for Ordoro auth
const userpass = process.env.ORDORO_CLIENT_ID + ":" + process.env.ORDORO_CLIENT_SECRET;  
const buff = new Buffer(userpass);  
const base64auth = buff.toString('base64')

exports.createOrdoroOrder = (body) => {

  return new Promise((resolve, reject) => {
    let options = {
        uri: '  https://api.ordoro.com/order/',
        headers: {'Authorization': "Basic  " + base64auth},
        method: 'POST',
        json: body
    };

    // make request to Ordoro
    request(options, function (error, response, body) {
        if(error) {
            reject(error)
        }
        resolve(response)
    })

  })
}

exports.parseLineItems = (items) => {
  let lines = []
  
  return new Promise((resolve, reject) => {
    for(let i = 0; i < items.length; i++) {
      let item = {
        quantity: items[i].quantity,
        product: {
          name: items[i].name,
          sku: items[i].sku,
        }
      }
  
      lines.push(item)
      if (lines.length === items.length) {
        resolve(lines)
      }
    }
  })
}

exports.parseAddress = moltinAddress => {
  let address = {
    name: moltinAddress.first_name + ' ' + moltinAddress.last_name,
    street1: moltinAddress.line_1,
    street2: moltinAddress.line_2,
    city: moltinAddress.city,
    state: moltinAddress.county,
    country: moltinAddress.country,
  }

  return address
}

exports.responseBuilder = code => message => {
  return {
    statusCode: code,
    body: JSON.stringify({
      message: message,
    }),
  };

}

const isOrdoroOrderShipped = id => {
  
  let options = {
    uri: `https://api.ordoro.com/order/${id}`,
    headers: {'Authorization': "Basic  " + base64auth},
    method: 'GET'
  }

  request(options, function (error, response, body) {
    if(response.statusCode === 200) {
      // NEED REAL ORDER RETURNED FROM ORDORO
      // return true or false
    }
  })
}

const markMoltinOrderFulfilled = async order => {
  await client.post(`/orders/${order.id}`, {
    type: 'order',
    id: order.id,
    shipping: 'fulfilled'
  })
}

exports.processAllUnshippedOrders = async () => {
  let offset = 0
  let url = '/orders?' + `page%5Boffset%5D=${offset}` + '&filter=eq(shipping,unfulfilled)'
  let unshippedOrdersResponse = await client.get(url)
  let totalPages = unshippedOrdersResponse.meta.page.total

  return new Promise(async (resolve, reject) => {
    for(let i = 0; i < totalPages; i++) {
      await processPageOfOrders(unshippedOrdersResponse.data)
      
      offset++
      unshippedOrdersResponse = await client.get(url)
      
      if(i === totalPages - 1) {
        resolve()
      }
    }
  })

}

const processPageOfOrders = orders => {
    return new Promise((resolve, reject) => {
      console.log('processing page of orders')
  
      let count = 0
  
      orders.forEach(async order => {
        await delay(1000)
        
        count++
  
        let isShipped = await isOrdoroOrderShipped(order.id)
  
        if(isShipped) {
          console.log('order shipped')
          await markMoltinOrderFulfilled(order)
        }
  
        if(count === orders.length) {
          resolve()
        }
      })
    })
  }

const delay = (amount = number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, amount);
  });
}