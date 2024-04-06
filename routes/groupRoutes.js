const { Router } = require("express");
const {
  createGroup,
  getGroupMessages,
  sendMessageInGroup,
  getUserGroups,

} = require("../controllers/group");
const { autherizeUser } = require("../middleware/authorizeUser");

const router = Router();

router.post("/", autherizeUser, createGroup);
router.get("/", autherizeUser, getUserGroups);

router.post("/:groupId/messages", autherizeUser, sendMessageInGroup);
router.get("/:groupId/messages", autherizeUser, getGroupMessages);

module.exports = router;
