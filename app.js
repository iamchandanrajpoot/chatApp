const path = require("path");
const fs = require("fs").promises;
const dotenv = require("dotenv");
dotenv.config();

const cors = require("cors");
const sequelize = require("./config/dbConfig");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes.js");
const groupRouter = require("./routes/groupRoutes.js");
const { app, server, io, express } = require("./server.js");
const Group = require("./models/group.js");
const User = require("./models/user.js");
const { getSockets, userSocketIDs } = require("./util/helper.js");
const uploadFileToCloudinary = require("./services/fileUpload.js");
const upload = require("./middleware/multer.js");

// associations
require("./models/association.js");

// middleware
require("./middleware/authorizeSocketUser.js");

// handle cors
app.use(cors());

// parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// handling routes
app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/groups", groupRouter);
// upload file
app.post("/upload", upload.single("uploaded_file"), async (req, res) => {
  try {
    const response = await uploadFileToCloudinary(req.file.path);
    if (response) {
      // delete file from server
      await fs.unlink(req.file.path);
      res.json({ response, success: true });
    } else {
      res.status(500).json({ error: "Error uploading file", success: false });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Error uploading file", success: false });
  }
});

app.use((req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname, `/frontend/${req.url}`));
});

// socket.io connection
io.on("connection", (socket) => {
  console.log("a user connected");
  const user = socket.user;
  userSocketIDs.set(`user_${user.id}`, socket.id);
  console.log(userSocketIDs);
  socket.on("post_message", async (data) => {
    try {
      console.log(data);
      const group = await Group.findOne({ where: { id: data.groupId } });
      if (group) {
        let resultMessage;
        if (data.mediaUrl) {
          resultMessage = await group.createMessage({
            mediaUrl: data.mediaUrl,
            userId: socket.user.id,
            userName: socket.user.name,
            isMediaFile: true,
          });
        } else {
          resultMessage = await group.createMessage({
            message: data.message,
            userId: socket.user.id,
            userName: socket.user.name,
          });
        }
        const socketMembers = getSockets(data.groupMembers);
        console.log(resultMessage);
        io.to(socketMembers).emit("new_message", {
          resultMessage,
          groupId: group.id,
        });
      } else {
        console.log("Group not found");
        // Inform the client that the group does not exist
        socket.emit("group_not_found", { groupId: data.groupId });
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("create_group", async (data) => {
    try {
      console.log("group data", data);
      const group = await Group.create({
        name: data.name,
        createdBy: socket.user.id,
      });

      await group.addUser(socket.user, { through: { isAdmin: true } });
      let users;
      if (data.userIds && data.userIds.length > 0) {
        users = await User.findAll({
          where: { id: data.userIds },
        });

        await group.addUsers(users, { through: { isAdmin: false } });
      }
      socket.emit("group_created", {
        users: users,
        groupId: group.id,
        message: "group created successfully",
        success: true,
      });
    } catch (error) {
      // Emit an error event and send an error message as data
      socket.emit("group_created", {
        message: "Group not created successfully",
        success: false,
      });
    }
  });

  socket.on("disconnect", () => {
    userSocketIDs.delete(`user_${user.id}`);
    console.log("user disconnected");
  });
});

sequelize
  .sync()
  .then(() => {
    console.log("models synced!");
    server.listen(process.env.PORT, () => {
      console.log(`App is listening on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
