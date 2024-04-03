const User = require("../models/user");

exports.postMessage = async (req, res) => {
  try {
    console.log(req.body);
    const userIsntance = await User.findByPk(req.user.id);
    await userIsntance.createMessage({ text: req.body.message });
    res
      .status(201)
      .json({ message: "message posted successfully", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const userIsntance = await User.findByPk(req.user.id);
    const messages = await userIsntance.getMessages();
    res.status(200).json({ messages, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
