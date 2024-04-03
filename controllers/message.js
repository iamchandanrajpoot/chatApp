const { Sequelize } = require("sequelize");
const Message = require("../models/message");
const User = require("../models/user");

exports.postMessage = async (req, res) => {
  try {
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
    const lastMessageId = req.query.lastMessageId || 0;
    // const userIsntance = await User.findByPk(req.user.id);
    console.log(typeof parseInt(lastMessageId), lastMessageId)
    const messages = await Message.findAll({
      where: { id: { [Sequelize.Op.gt]: parseInt(lastMessageId) } },
    });

    res.status(200).json({ messages, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "internal server error" });
  }
};
