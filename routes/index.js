const express = require('express');
const request = require('request');
const redis = require('../config/redis');
const router = express.Router();
const random = require('string-random');
const DEF_DOMAIN = 'http://175kdyy.pjlxjsoj.xyz/';
const POOL_KEY = 'domain:show';
const {resolve} = require('path')
const fs = require('fs');
const downData = require("../public/data/comment_data.json");
const config = require("../config/config")
const cfg = config['openapi'][process.env.NODE_ENV || 'dev'];

/* GET home page. */
router.get('/:x?.html', function(req, res) {
    let code = "12345";  
    if (null != req.params.x && "" != req.params.x) {
        code = req.params.x;
    }
 
    // 判断是否是PC打开链接 
    if (isPCBrowser(req)){  
        res.writeHead(302, {'Location': '/pc/' + code + '.html'});
        res.end()
        return;
    }
     
    // 判断是否是QQ或者微信内置浏览器
    let showTip = isWeixinOrQQInner(req);
    
    let ordr = [['sort', 'asc']];

    redis.client.get(redis.downConfig, (configerr,downconfig) => {
        getAppPackage(function(appData){
            getH5Domain(function(url){
                // 落地页配置数据
                const jsonConfig = JSON.parse(downconfig)

                let e = 'pushId@' + code + "@" + (code || ''); 
                let ua = req.headers['user-agent'];
                
                if (url.indexOf("{code}") > -1){
                    url = url.replace("{code}",e)
                }else{
                    url = url + "?invitations="+e;
                }
                let isandroid = false
                if (/Android/.test(ua)){
                    isandroid = true
                }else if (/iPhone/.test(ua) || /iPad/.test(ua) || /iPod/.test(ua)){
                    
                }
                // 处理下载连接
                let apkurl = "";
                let iosurl = "";
                let iosbackurls = [];
                const jsonAppDownloadUrls = JSON.parse(appData);
                let iosurls = jsonAppDownloadUrls.filter(items=>{
                    return items.os == 1
                })
    
                if (iosurls.length > 0){
                    iosurl = iosurls[0]
                    if (iosurls[0].updateUrls){
                        iosbackurls = iosurls[0].updateUrls
                    }
                }
                
                let apkurls = jsonAppDownloadUrls.filter(items=>{
                    return items.os == 0
                })
    
                if (apkurls.length > 0){
                    apkurl = apkurls[0].url
                }
                
                res.render('microvideoshare', {
                    title: 'Share',
                    TestFlight:"https://itunes.apple.com/cn/app/testflight/id899247664?mt=8", //testflight appstore 唤起链接
                    IOSdonwUrl: cfg.domain + "/snsapi/ver/query/light.mobileconfig?code=" + code,   //轻量版下载链接                
                    vcode: code,
                    h5url: url,
                    data : encodeURIComponent( JSON.stringify(downData)),
                    renderData : downData,
                    downUrls : encodeURIComponent(appData),
                    showWeixinTip:showTip,  
                    isandroid:isandroid,
                    iosbackurls: iosbackurls,
                    iosdownloadurl: iosurl,
                    jsonConfig: jsonConfig
                });
            })
        });
    })
    
});

router.get('/pc/:x?.html', function(req, res) {
    let code = "12345"; 
    if (null != req.params.x && "" != req.params.x) {
        code = req.params.x;
    }

   
    res.render('microvideosharepc', { 
        vcode: code,
        data : encodeURIComponent( JSON.stringify(downData)),
        renderData : downData,
    });
    
});

/***
 * 落地页的网关
 */
router.get('/downn_device', function(req, res) {
    let code = req.query.code ? req.query.code : "12345";
    let data_path = resolve('./public/data/down_data.json');
    
    let data = JSON.parse(fs.readFileSync(data_path).toString());
    // 判断浏览器代理
    let ua = req.headers['user-agent'];
    let url = "/downn?code="+code; 
    if (/Android/.test(ua)){
        url = data.androidUrl;
    }else if (/iPhone/.test(ua) || /iPad/.test(ua)){
        url = data.iosUrl;
    }else{
        
    }
    url  = url.replace("{code}",code);
    console.log(url)
    res.location(url);
    res.send(301);
});

/****
 * 分享页面
 * 如果是微信浏览器直接跳转到引导页
 * 如果非微信浏览器直接301到域名池
 */
router.get('/share', function(req, res) {
    var code = req.query.code ? req.query.code : "12345";
    code = code.replace('/','');
    redis.client.srandmember(POOL_KEY, function(err, ret) {
        var url = DEF_DOMAIN;
        if (null != ret && "" != ret.trim())
        {
            url = ret.charAt(ret.length-1) == '/' ? ret : ret + '/';
            check(ret); 
            res.writeHead(302, {'Location': url + code + '.html?pushId=' + random()});
            console.log(res._header);
            res.end()
        }
        else {
            find(function(val){
                url = val; ;
                res.writeHead(302, {'Location': url + code + '.html?pushId=' + random()});
                console.log(res._header);
                res.end()
            });
        }
    });
});

/****
 * 主页
 * 如果是微信浏览器直接跳转到引导页
 * 如果非微信浏览器直接301到域名池
 */
router.get('/', function(req, res) {
    var code = random();
    redis.client.srandmember(redis.downDomains, function(err, ret) {
        var url = DEF_DOMAIN;
        if (null != ret && "" != ret.trim())
        {
            url = ret.charAt(ret.length-1) == '/' ? ret : ret + '/';
            check(ret); ;
            res.writeHead(302, {'Location': url + code + '.html'});
            console.log(res._header);
            res.end()
        }
    });
});

/****
 * 判断地址是否可以访问，如果不能访问直接删除地址池中地址
 * @param url
 */
function check(ret)
{
    var  options = {
        method: 'get',
        url: ret,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };
    
    request(options, function (err, res, body) {
        if (err) {
            redis.client.srem(POOL_KEY, ret);
        }else {
            console.log(body);
        }
    })
}


function getH5Domain(callback){
    redis.client.GET(redis.h5Domain, function(err, ret) {
        let url = "";
        if (null != ret && "" != ret.trim()){
            url = ret;
        }
        callback(url);
    });
}

/**
 * 
 * @param {获取app包连接} callback 
 */
 function getAppPackage(callback){
    redis.client.get(redis.lastKey, function(err, data) {
        if (null != data ) {
            console.log('cache:' + data);
            callback(data);
        }
    });
}

/**
 * 判断是否是微信或者QQ内置浏览器
 * @param {*} req 
 * @returns 
 */
function isWeixinOrQQInner(req){
    let userAgent = req.headers['user-agent'].toLowerCase();
    let reg = /MicroMessenger/i;
    if (reg.test(userAgent)) {
        return true;
    }
    if(userAgent.indexOf('mqqbrowser')> -1 && userAgent.indexOf("qq")<0 || userAgent.indexOf("qq") > -1 && userAgent.indexOf('mqqbrowser')<0){
        //qq浏览器
        return true;
    }
    return false;
}


/**
 * 判断是否是微信或者QQ内置浏览器
 * @param {*} req 
 * @returns 
 */
 function isPCBrowser(req){
    let userAgent = req.headers['user-agent'].toLowerCase();
    let reg = /(iphone|ipod|ipad|android)/i;
    return !reg.test(userAgent);
    
}

module.exports = router;
