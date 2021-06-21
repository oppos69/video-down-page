const redis = require('redis');
const config = require('./config');

//export NODE_ENV=dev
const cfg = config['redis'][process.env.NODE_ENV || 'dev'];

const ENV_REDIS_URI = process.env.REDIS_URI
console.log("env_redis_uri:" ,ENV_REDIS_URI)
if (ENV_REDIS_URI){
    cfg['uri'] = ENV_REDIS_URI
}
const client = redis.createClient(cfg['uri'], {db:cfg['db']});
// 缓存key
const KEY_VER_LAST = 'sys:ver:last:node';
const KEY_VER_LAST_VERSION = 'sys:ver:last:version';
const H5_DOMAIN = 'sys:ver:last:domain:h5';
const DOWN_DOMAINS = "sys:ver:last:domain:down";
const DOWN_CONFIG = "sys:ver:last:config";

client.on('connect',function(){
    console.log('------ Redis connection succeed ------');
});

client.auth(cfg['pwd'],function(){
    console.log('env:' + (process.env.NODE_ENV || 'dev'));
});

client.on('error',function(res){
    console.log('------ Redis connection failed ------' + res);
});

module.exports = {
    redis: redis,
    client: client,
    lastKey: KEY_VER_LAST,
    lastVersion: KEY_VER_LAST_VERSION,
    h5Domain: H5_DOMAIN,
    downDomains : DOWN_DOMAINS,
    downConfig: DOWN_CONFIG
};

