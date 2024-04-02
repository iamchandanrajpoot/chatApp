const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

exports.loginController = async (req, res) => {
  try {
    console.log(req.body);
    const user = await User.findOne({ where: { email: req.body.email } });
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      jwt.sign({ id: user.id }, "privateKey", (err, token) => {
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
        .status(404)
        .json({ message: "wrong email or password", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error", success: false });
  }
};
