const User = require("../models/user");

exports.postMessage = async (req, res) => {
  try {
    console.log(req.body)
    const userIsntance = await User.findByPk(req.user.id);
    await userIsntance.createMessagge({ text: req.body.message });
    res
      .status(201)
      .json({ message: "message posted successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
