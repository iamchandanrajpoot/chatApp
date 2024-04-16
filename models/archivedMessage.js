const sequelize = require("../configs/dbConfig");
const { DataTypes } = require("sequelize");

const ArchivedMessage = sequelize.define(
  "ArchivedMessage",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true, // Allow null because either text or media file URL will be present
    },
    mediaUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isMediaFile: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  { updatedAt: false }
);

module.exports = ArchivedMessage;
