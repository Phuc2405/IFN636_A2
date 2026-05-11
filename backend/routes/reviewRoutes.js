const express = require("express");
const router = express.Router();

const {
  writeReview,
  updateReview,
  deleteReview,
  getMyReviews,
  getReviewsByAlbum,
  getMyReviewForAlbum,
  getAlbumRatingStats,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Get my reviews
router.get("/", protect, getMyReviews);
router.get("/my-reviews", protect, getMyReviews);

// Get all community reviews for one album
router.get("/album/:albumID", protect, getReviewsByAlbum);

// Get current user's review for one album
router.get("/album/:albumID/my-review", protect, getMyReviewForAlbum);

// Write a review
router.post("/", protect, writeReview);

// Update a review
router.put("/:id", protect, updateReview);

// Delete a review
router.delete("/:id", protect, deleteReview);

router.get("/album/:albumID/stats", protect, getAlbumRatingStats);

module.exports = router;
