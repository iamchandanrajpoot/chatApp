const { Router } = require("express");
const {
  registerController,
  loginController,
  getAllUsers,
} = require("../controllers/userController");
const { autherizeUser } = require("../middlewares/authorizeUser");

const router = Router();

router.post("/register", registerController);
router.post("/login", loginController);

router.get("/", autherizeUser, getAllUsers);
module.exports = router;
