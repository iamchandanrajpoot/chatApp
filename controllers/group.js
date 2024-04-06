const { Sequelize } = require("sequelize");
const Group = require("../models/group");
const User = require("../models/user");

// create group
exports.createGroup = async (req, res) => {
  const { name, userIds } = req.body;
  userIds.push(req.user.id);
  try {
    // Create the group
    const group = await Group.create({ name: name, createdBy: req.user.id });
    // If userIds are provided, add users to the group
    if (userIds && userIds.length > 0) {
      const users = await User.findAll({
        where: {
          id: userIds,
        },
      });
      // Add users to the group
      await group.addUsers(users);
    }
    res
      .status(201)
      .json({ message: "successfully created message", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};
// send message in bgroup
exports.sendMessageInGroup = async (req, res) => {
  const { groupId } = req.params;
  try {
    // user post message in group
    const group = await Group.findOne({ where: { id: groupId } });
    //  const user = await group.hasUser(req.user.id)
    await group.createMessage({
      message: req.body.message,
      userId: req.user.id,
    });

    res
      .status(201)
      .json({ message: "successfully posted message", success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", success: false });
  }
};

// get all groups associated with user
exports.getUserGroups = async (req, res) => {
  try {
    console.log("codnskfgslgl");
    const groups = await req.user.getGroups();
    const groupsWithUserCounts = await Promise.all(groups.map(async (group) => {
      const userCount = await group.countUsers();
      return { group, userCount };
  }));
  
  
    res.status(200).json({ groupsWithUserCounts , success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server errro", success: false });
  }
};

// get message associated with group
exports.getGroupMessages = async (req, res) => {
  const lastMessageId = req.query.lastMessageId || 0;
  const { groupId } = req.params;
  try {
    const group = await Group.findOne({ where: { id: groupId } });
    if (group) {
      const groupMessages = await group.getMessages({
        where: { id: { [Sequelize.Op.gt]: parseInt(lastMessageId) } },
      });
      return res.status(200).json({ groupMessages, success: true });
    }
    res.status(200).json({ message: "group not difined", success: false });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server errro", success: false });
  }
};
