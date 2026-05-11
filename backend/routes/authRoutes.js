const express = require("express");

const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { getUserInfo } = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user_info", protect, getUserInfo);
router.post("/logout", protect, logoutUser);

module.exports = router;
