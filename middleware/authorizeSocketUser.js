const User = require("../models/user.js");
const { io } = require("../server.js");
const jwt = require("jsonwebtoken");

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    // verify the token
    jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, decoded) => {
      if (err) {
        console.log(err);
      }
      const user = await User.findByPk(decoded.id);
      // attach the user to the socket
      socket.user = user;
      next();
    });
  }
});
