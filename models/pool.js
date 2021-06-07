const Sequelize = require('sequelize');
const sequelize = require('../config/mysqldb');

const Model = sequelize.define('bs_domain', {
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    state: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    is_del: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, {freezeTableName: true, timestamps: false});

module.exports = Model;
