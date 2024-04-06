const { Router } = require("express");
const {
  registerController,
  loginController,
  getAllUsers,
} = require("../controllers/user");
const { autherizeUser } = require("../middleware/authorizeUser");

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.get("/",autherizeUser, getAllUsers);
module.exports = router;
