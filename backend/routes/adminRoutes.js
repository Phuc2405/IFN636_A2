const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const { getAllReviews } = require("../controllers/reviewController");
const { deleteReviewByAdmin } = require("../controllers/adminController");

router.get("/reviews", protect, admin, getAllReviews);
router.delete("/reviews/:id", protect, admin, deleteReviewByAdmin);

module.exports = router;
