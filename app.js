const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors")

const sequelize = require("./config/dbConfig");
const userRouter = require("./routes/userRoutes");

// associations
require("./models/associations/user_message.js")
const app = express();

// handle cors
app.use(cors())

// parsing body
app.use(express.urlencoded({extended: true}));
app.use(express.json());

// handling routes
app.use("/user", userRouter)

sequelize
//   .sync({force: true})
  .sync()
  .then(() => {
    console.log("models synced!")
    app.listen(3000, () => {
      console.log("App is listening on http://localhost:3000");
    });
  })
  .catch((error) => {
    console.log(error);
  });
