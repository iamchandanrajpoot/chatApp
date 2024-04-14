const userSocketIDs = new Map();

function getSockets(users = []) {
  const sockets = users.map((user) => {
    return userSocketIDs.get(`user_${user.id}`);
  });
  return sockets.filter((socket) => {
    if (socket) {
      return socket;
    }
  });
}

module.exports = { getSockets, userSocketIDs };
