const Messagge = require("../message");
const User = require("../user");

User.hasMany(Messagge, {foreignKey: "userId"})
Messagge.belongsTo(User, {foreignKey: "userId"});