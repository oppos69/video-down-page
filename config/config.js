// 设置环境变量
//export NODE_ENV=dev 开发
//export NODE_ENV=pro 生产
let openapi = {
    dev: {
        appid: "10002", 
        appkey: "b7df49a96c264a009ec5ea43a2225cb3",
        domain: "http://microopenapi.f6978.hk"
    },
    pro: {
        appid: "10002", 
        appkey: "b7df49a96c264a009ec5ea43a2225cb3",
        domain: "http://microopenapi.f6978.hk"
    }
}
const ENV_API_URI = process.env.API_URI
console.log("env_api_uri:" ,ENV_API_URI)
if (ENV_API_URI){
    openapi.dev.domain = ENV_API_URI.trim();
    openapi.pro.domain = ENV_API_URI.trim();
}

module.exports = {
    redis: {
        dev: {
            uri: 'redis://103.120.82.133:6380',
            pwd: 'mmc@gogo123',
            db: 0,
        },
        pro: {
            uri: 'redis://192.168.10.14:6379',
            pwd: 'mmc@gogo123',
            db: 0,
        }
    },
    openapi
};