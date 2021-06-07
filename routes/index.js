const express = require('express');
const request = require('request');
const redis = require('../config/redis');
const router = express.Router();
const random = require('string-random');
const dPool = require('../models/pool');
const DEF_DOMAIN = 'http://175kdyy.pjlxjsoj.xyz/';
const POOL_KEY = 'domain:show';
const DOMAIN_H5 = 'domain:h5';
const domain = require('../models/domain');
const {resolve} = require('path')
const fs = require('fs');
const downData = require("../public/data/comment_data.json");
const verDb = require('../models/ver');


/* GET home page. */
router.get('/:x?.html', function(req, res) {
    let code = "12345";
    if (null != req.params.x && "" != req.params.x) {
        code = req.params.x;
    }
    // let pushId = req.query.pushId;

    // console.log('code:' + code + ', pushId:' + pushId);
    // res.render('index', {
    //     title: 'Index',
    //     vcode: code,
    //     vpush: pushId,
    // });
    // 判断是否是QQ或者微信内置浏览器
    let showTip = isWeixinOrQQInner(req);
    console.log(showTip)
    let ordr = [['sort', 'asc']];
    getAppPackage(function(appData){
        getH5Domain(function(url){
            let e = 'pushId@' + code + "@" + (code || '');
            if (url.indexOf("{code}") > -1){
                url = url.replace("{code}",e)
            }else{
                url = url + "?invitations="+e;
            }
            res.render('share', {
                title: 'Share',
                vcode: code,
                h5url: url,
                data : encodeURIComponent( JSON.stringify(downData)),
                renderData : downData,
                downUrls : encodeURIComponent(appData),
                showWeixinTip:showTip
            });
        })
    });
    
});

/***
 * 落地页
 */
router.get('/down', function(req, res) {
    let code = req.query.code ? req.query.code : "12345";
    //查询h5apiurl
    let ordr = [['sort', 'asc']];
    domain.findOne({attributes: ['domain'], raw: true, where: {type: '11', state: '1'}, order:ordr, limit: 1}).then(item => {
        res.render('share', {
            title: 'Share',
            vcode: code,
            h5url: item.domain,
            data : encodeURIComponent( JSON.stringify(downData)),
            renderData : downData
        });
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
            console.log(url);
            res.writeHead(302, {'Location': url + code + '.html?pushId=' + random()});
            console.log(res._header);
            res.end()
        }
        else {
            find(function(val){
                url = val;
                console.log(url);
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
    redis.client.srandmember(POOL_KEY, function(err, ret) {
        var url = DEF_DOMAIN;
        if (null != ret && "" != ret.trim())
        {
            url = ret.charAt(ret.length-1) == '/' ? ret : ret + '/';
            check(ret);
            console.log(url);
            res.writeHead(302, {'Location': url + code + '.html'});
            console.log(res._header);
            res.end()
        }
        else {
            find(function(val){
                url = val;
                console.log(url);
                res.writeHead(302, {'Location': url + code + '.html'});
                console.log(res._header);
                res.end()
            });
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

var find = function(callback)
{
    dPool.findAll({raw: true, where: {is_del:'0'}}).then(posts => {
        // 拼接下载地址
        let len = posts.length;
        if (0 >= len) {
            return;
        }

        for(let i=0; i < len; i++) {
            redis.client.sadd(POOL_KEY, posts[i]['name']);
        }

        callback(posts[0]['name']);
    });
}

function getH5Domain(callback){
    redis.client.GET(DOMAIN_H5, function(err, ret) {
        let url = "";
        if (null != ret && "" != ret.trim()){
            url = ret;
        }else{
            let ordr = [['sort', 'asc']];
            domain.findOne({attributes: ['domain'], raw: true, where: {type: '11', state: '1'}, order:ordr, limit: 1}).then(item => {
                url = item.domain;
                redis.client.set(DOMAIN_H5, url);
            });
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
        else {
            let attrs = ['domain'];
            let ordr = [['sort', 'asc']];
            var url = "";
            // 获取第一条存储地址
            domain.findOne({attributes: attrs, raw: true, where: {type:'27', state:'1'}, order: ordr, limit: 1}).then(function(data) {
                let ret = data.domain;
                if (null != ret && "" != ret.trim()) {
                    url = ret.charAt(ret.length-1) == '/' ? ret : ret + '/';
                }

                let attr = ['url', 'os', 'update_url','time_update'];
                // 获取最新的下载地址
                verDb.findAll({attributes: attr, raw: true, where: {last_id:'0', status:'1'}}).then(posts => {
                    // 拼接下载地址
                    let len = posts.length;
                    for(let i=0; i < len; i++) {
                        posts[i]['url'] = url + posts[i]['url'];
                    }
                    // 将对象转为json字符串
                    let json = JSON.stringify(posts);
                    redis.client.set(redis.lastKey,json);
                    callback(json);
                });
            });
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


module.exports = router;
