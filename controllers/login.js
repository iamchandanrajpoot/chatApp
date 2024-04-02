const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.loginController = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user) {
      if (await bcrypt.compare(req.body.password, user.password)) {
        jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, (err, token) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "internal server error", success: false });
          } else {
            return res
              .status(200)
              .json({ message: "successfully login", token, success: true });
          }
        });
      } else {
        res
          .status(401)
          .json({ message: "User not authorized", success: false });
      }
    } else {
      res.status(404).json({ message: "User not found", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error", success: false });
  }
};
