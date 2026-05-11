const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
const { getUserInfo } = require("../controllers/authController");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/user_info", protect, getUserInfo);
module.exports = router;
