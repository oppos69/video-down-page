
const request = require('request');
const config = require('../config/config');
const crypto = require('crypto');
const cfg = config['openapi'][process.env.NODE_ENV || 'dev'];



function getSign(data){
  let params = [];
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      params.push(key + "=" + element)
    }
  }
  params.sort();
  
  const keys = params.join("&") + "&key=" + cfg.appkey
  //console.log("sign keys: " + params);
  const result = crypto.createHash('md5').update(keys).digest("hex")
  return result;
}

module.exports = {
  get(url,callback) {
    request.get(cfg.domain + url ,callback)
  },
  post(url,sdata,callback) {
    let requestData = Object.assign(sdata,{
      appid: cfg.appid
    })

    const sign = getSign(requestData)
    requestData.sign = sign;
    //console.log("request data:" + JSON.stringify(requestData))
    request.post(cfg.domain + url, {
      json: requestData,
      headers: [
        {
          name: 'content-type',
          value: 'application/json'
        }
      ]
    }, callback)
  }
}