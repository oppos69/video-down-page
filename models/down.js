const Sequelize = require('sequelize');
const sequelize = require('../config/mysqldb');

const Model = sequelize.define('app_down', {
    user_agent: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ip: {
        type: Sequelize.STRING,
        allowNull: false
    },
    os: {
        type: Sequelize.STRING,
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE
    },
    updated_at: {
        type: Sequelize.DATE
    }
}, {freezeTableName: true, timestamps: false});

module.exports = Model;