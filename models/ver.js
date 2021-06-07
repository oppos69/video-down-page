const Sequelize = require('sequelize');
const sequelize = require('../config/mysqldb');

const Model = sequelize.define('sys_ver', {
    url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    os: {
        type: Sequelize.STRING,
        allowNull: false
    },
    update_url: {
        type: Sequelize.STRING,
        allowNull: false
    },
    last_id: {
        type: Sequelize.STRING,
        allowNull: false
    },
    status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    time_update: {
        type: Sequelize.DATE
    }
}, {freezeTableName: true, timestamps: false});

module.exports = Model;
