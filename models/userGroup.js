const { DataTypes } = require("sequelize");
const sequelize = require("../configs/dbConfig");

const UserGroup = sequelize.define(
  "UserGroup",
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { timestamps: false }
);

module.exports = UserGroup;
