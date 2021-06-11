const express = require('express');
const router = express.Router();
const request = require("../utils/requestClient")

/* 获取最新版本. */
router.post('/profile', function(req, res, next)
{
    //可以解决跨域的请求
    res.writeHead(200, {"Content-Type": "application/json",'charset':'utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'PUT,POST,GET,DELETE,OPTIONS'});
    let os = req.query.os;
    let ua = req.headers['user-agent'].toLowerCase();
    let ip = getClientIp(req);

    request.post("/snsapi/ver/appdown/report",{
        noncestr: strRandom(10),
        ip: ip,
        os: os,
        userAgent: ua
      },(err,response,body) => {
        if(err){
          console.log("上报下载数据错误：" + err)
        }else{
        //  console.log(body)
          //console.log("ver-query: " + JSON.stringify(body))
        }
        res.write("success");
        res.end();
      });
});

/****
 * 获取客户度IP地址
 * @param req
 * @returns {*|string}
 */
function getClientIp(req) {
    return req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
};

module.exports = router;