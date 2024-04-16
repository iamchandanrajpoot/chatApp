const { Router } = require("express");
const { autherizeUser } = require("../middlewares/authorizeUser");
const {
  postMessage,
  getMessages,
} = require("../controllers/messageController");

const router = Router();

router.post("/send", autherizeUser, postMessage);
router.get("/", autherizeUser, getMessages);

module.exports = router;
