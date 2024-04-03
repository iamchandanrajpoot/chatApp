const { Router } = require("express");
const { autherizeUser } = require("../middleware/authorizeUser");
const { postMessage, getMessages } = require("../controllers/message");

const router = Router()


router.post("/send", autherizeUser, postMessage)
router.get("/", autherizeUser, getMessages)


module.exports = router;