const Message = require("../message");
const User = require("../user");

User.hasMany(Message, {foreignKey: "userId"})
Message.belongsTo(User, {foreignKey: "userId"});