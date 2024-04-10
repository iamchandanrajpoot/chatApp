const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");

const sequelize = require("./config/dbConfig");
const userRouter = require("./routes/userRoutes");
const messageRouter = require("./routes/messageRoutes.js");
const groupRouter = require("./routes/groupRoutes.js");

// associations
require("./models/association.js");

const app = express();

// handle cors
app.use(cors());

// parsing body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// handling routes
app.use("/user", userRouter);
app.use("/message", messageRouter);
app.use("/groups", groupRouter);

app.use((req, res) => {
  console.log(req.url);
  res.sendFile(path.join(__dirname, `/frontend/${req.url}`));
});

sequelize
  .sync()
  .then(() => {
    console.log("models synced!");
    app.listen(process.env.PORT, () => {
      console.log(
        `App is listening on http://15.206.195.100:${process.env.PORT}`
      );
    });
  })
  .catch((error) => {
    console.log(error);
  });
