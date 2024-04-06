const { DataTypes } = require("sequelize");
const sequelize = require("../config/dbConfig");

const UserGroup = sequelize.define("UserGroup", {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
    }
}, {timestamps: false})


module.exports = UserGroup;