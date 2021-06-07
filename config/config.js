// 设置环境变量
//export NODE_ENV=dev 开发
//export NODE_ENV=pro 生产
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
    mysql: {
        dev: {
            host: '103.120.82.133',
            port: '3307',
            dialect: 'mysql',
            database: 'video',
            username: 'video',
            password: 'video@202007',
            loger: false,
        },
        pro: {
            host: '192.168.10.13',
            port: '3306',
            dialect: 'mysql',
            database: 'video',
            username: 'video',
            password: 'video@2019',
            loger: false,
        }
    },
};