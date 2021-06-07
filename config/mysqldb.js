const Sequelize = require('sequelize');
const config = require('./config');
const cfg = config['mysql'][process.env.NODE_ENV || 'dev'];

module.exports = new Sequelize(cfg['database'], cfg['username'], cfg['password'], {
    host: cfg['host'],
    port: cfg['port'],
    dialect: cfg['dialect'],
    logging: cfg['loger'],
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    operatorsAliases: false
});

