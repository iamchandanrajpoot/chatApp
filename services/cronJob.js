const sequelize = require("../configs/dbConfig");
const ArchivedMessage = require("../models/archivedMessage");
const Message = require("../models/message");

exports.cronJobHandler = async () => {
  const t = await sequelize.transaction();
  try {
    // Calculate the date 1 day ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Find 1-day-old messages from Chat table
    const messages = await Message.findAll({
      where: {
        createdAt: { [sequelize.Op.lt]: oneDayAgo },
      },
      transaction: t,
    });

    // Move messages to ArchivedChat table
    await ArchivedMessage.bulkCreate(
      messages.map((msg) => ({
        message: msg.message,
        userName: msg.userName,
        createdAt: msg.createdAt,
      })),
      { transaction: t }
    );

    // Delete 1-day-old messages from Chat table
    await Chat.destroy({
      where: {
        createdAt: { [sequelize.Op.lt]: oneDayAgo },
      },
      transaction: t,
    });

    await t.commit();
    console.log("Messages moved and deleted successfully");
  } catch (error) {
    console.error("Error moving and deleting messages:", error);
    await t.rollback();
  }
};
