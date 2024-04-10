const { Router } = require("express");
const {
  createGroup,
  getGroupMessages,
  sendMessageInGroup,
  getUserGroups,
  getGroupUsers,
  getRemainingUsers,
  addUserToGroup,
  removeUserFromGroup,
  makeUserAdmin,
} = require("../controllers/group");
const { autherizeUser } = require("../middleware/authorizeUser");

const router = Router();

router.post("/", autherizeUser, createGroup);
router.get("/", autherizeUser, getUserGroups);

router.post("/:groupId/messages", autherizeUser, sendMessageInGroup);
router.get("/:groupId/messages", autherizeUser, getGroupMessages);

router.get("/:groupId/members", autherizeUser, getGroupUsers);
router.get("/:groupId/remaining-users", autherizeUser, getRemainingUsers);

router.post("/add-user", autherizeUser, addUserToGroup);
router.post("/remove-user", autherizeUser, removeUserFromGroup);
router.post("/make-admin", makeUserAdmin);

module.exports = router;
