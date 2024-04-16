const { Sequelize, Op } = require("sequelize");
const Group = require("../models/group");
const User = require("../models/user");
const UserGroup = require("../models/userGroup");

// create group
exports.createGroup = async (req, res) => {
  const { name, userIds } = req.body;
  try {
    // Create the group
    const group = await Group.create({ name: name, createdBy: req.user.id });

    // Add the user who created the group to the group with isAdmin set to true
    await group.addUser(req.user, { through: { isAdmin: true } });

    // If userIds are provided, add other users to the group
    if (userIds && userIds.length > 0) {
      const users = await User.findAll({
        where: {
          id: userIds,
        },
      });
      // Add other users to the group with isAdmin set to false
      await group.addUsers(users, { through: { isAdmin: false } });
    }
    res
      .status(201)
      .json({ message: "successfully created message", group, success: true });
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
      userName: req.user.name,
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
    const groups = await req.user.getGroups();
    const groupsWithUserCounts = await Promise.all(
      groups.map(async (group) => {
        const userCount = await group.countUsers();
        return { group, userCount };
      })
    );

    res.status(200).json({ groupsWithUserCounts, success: true });
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

// get all users of a group
exports.getGroupUsers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findOne({ where: { id: groupId } });
    if (group) {
      const users = await group.getUsers();
      res.status(200).json({ users, success: true });
    } else {
      res.status(404).json({ message: "Group not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server errro", success: false });
  }
};

// get remaing user which are not in a group with groupId
exports.getRemainingUsers = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const group = await Group.findOne({ where: { id: groupId } });
    if (group) {
      const users = await User.findAll({
        where: {
          id: {
            [Op.notIn]: Sequelize.literal(
              `(SELECT userId FROM UserGroups WHERE groupId = ${groupId})`
            ),
          },
        },
      });
      res.status(200).json({ users, success: true });
    } else {
      res.status(404).json({ message: "Group not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server errro", success: false });
  }
};

exports.addUserToGroup = async (req, res) => {
  try {
    console.log("ghgjhkjjhvg fhgjhkj hh ----------- j");
    console.log(req.body);
    const groupId = req.body.groupId;
    const userId = req.body.userId;
    const group = await Group.findOne({ where: { id: groupId } });
    const user = await User.findOne({ where: { id: userId } });
    if (group && user) {
      await group.addUser(user, { throw: UserGroup });
      res
        .status(200)
        .json({ message: "user added to group successfully", success: true });
    } else {
      res
        .status(404)
        .json({ message: "Group or user not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server errro", success: false });
  }
};

exports.removeUserFromGroup = async (req, res) => {
  try {
    const groupId = req.body.groupId;
    const userId = req.body.userId;
    const group = await Group.findOne({ where: { id: groupId } });
    const user = await User.findOne({ where: { id: userId } });
    if (group && user) {
      await group.removeUser(user);
      res.status(200).json({
        message: "user removed from group successfully",
        success: true,
      });
    } else {
      res
        .status(404)
        .json({ message: "Group or user not found", success: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error", success: false });
  }
};

exports.makeUserAdmin = async (req, res) => {
  const groupId = req.body.groupId;
  const userId = req.body.userId;
  try {
    const group = await Group.findOne({ where: { id: groupId } });
    const user = await User.findOne({ where: { id: userId } });
    if (group && user) {
      await group.addUser(user, { through: { isAdmin: true } });
      res
        .status(200)
        .json({ message: "user made admin successfully", success: true });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error", success: false });
  }
};
