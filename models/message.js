const sequelize = require("../config/dbConfig");
const { DataTypes } = require("sequelize");

const Messagge = sequelize.define("Messagge", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Messagge;
