const {Router}= require("express");
const { registerController } = require("../controllers/register");
const { loginController } = require("../controllers/login");

const router = Router();

router.post("/register", registerController)
router.post("/login", loginController)

module.exports = router;