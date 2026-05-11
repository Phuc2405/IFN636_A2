const Review = require("../models/Review");
const Album = require("../models/Album");

// GET MY REVIEWS (authenticated user only)
const getMyReviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to view your reviews" });
    }

    const reviews = await Review.find({ userID: req.user.id })
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// WRITE REVIEW
// Don't allow guest to write or use URL
const writeReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Please log in or sign up to write a review" });
    }

    const { albumID, reviewRate, reviewContent } = req.body;

    if (!albumID || !reviewRate || !reviewContent) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const album = await Album.findById(albumID);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Check if user has already reviewed this album
    const existingReview = await Review.findOne({
      userID: req.user.id,
      albumID,
    });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this album" });
    }

    const review = await Review.create({
      albumID,
      userID: req.user.id,
      reviewRate,
      reviewContent,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname");

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// EDIT REVIEW
// Only user own the review and logged in can edit
const updateReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to edit a review" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to edit this review" });
    }

    const { reviewRate, reviewContent } = req.body;

    if (reviewRate !== undefined) review.reviewRate = reviewRate;
    if (reviewContent !== undefined) review.reviewContent = reviewContent;

    await review.save(); // Update at auto update time

    const populatedReview = await Review.findById(review._id)
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname");

    res.status(200).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE REVIEW
// Only user own the review and logged in can delete
const deleteReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to delete a review" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({ message: "You are not allowed to delete this review" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET REVIEWS FOR ONE ALBUM
const getReviewsByAlbum = async (req, res) => {
  try {
    const reviews = await Review.find({ albumID: req.params.albumID })
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname email type")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CURRENT USER'S REVIEW FOR ONE ALBUM
const getMyReviewForAlbum = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "You must be logged in to view your review" });
    }

    const review = await Review.findOne({
      albumID: req.params.albumID,
      userID: req.user.id,
    })
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname email type");

    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname email type")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET ALBUM RATING STATISTICS
const getAlbumRatingStats = async (req, res) => {
  try {
    const reviews = await Review.find({
      albumID: req.params.albumID,
    });

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (reviews.length === 0) {
      return res.status(200).json({
        averageRating: 0,
        totalReviews: 0,
        distribution,
      });
    }

    let totalScore = 0;

    reviews.forEach((review) => {
      totalScore += review.reviewRate;
      distribution[review.reviewRate] += 1;
    });

    const averageRating = Number((totalScore / reviews.length).toFixed(1));

    res.status(200).json({
      averageRating,
      totalReviews: reviews.length,
      distribution,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  getMyReviews,
  writeReview,
  updateReview,
  deleteReview,
  getReviewsByAlbum,
  getMyReviewForAlbum,
  getAlbumRatingStats,
  getAllReviews,
};
