const Sequelize = require('sequelize');
const sequelize = require('../config/mysqldb');

const Model = sequelize.define('t_domain', {
    type: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    domain: {
        type: Sequelize.STRING,
        allowNull: false
    },
    sort: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    state: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, {freezeTableName: true, timestamps: false});

module.exports = Model;
