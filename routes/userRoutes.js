const {Router}= require("express");
const { registerController } = require("../controllers/register");
const { loginController } = require("../controllers/login");
const { autherizeUser } = require("../middleware/authorizeUser");
const { postMessage } = require("../controllers/message");


const router = Router();

router.post("/register", registerController)
router.post("/login", loginController)
router.post("/send", autherizeUser, postMessage)

module.exports = router;