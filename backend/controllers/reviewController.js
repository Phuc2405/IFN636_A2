const Review = require("../models/Review");
const Album = require("../models/Album");

// GET MY REVIEWS (authenticated user only)
const getMyReviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "You must be logged in to view your reviews",
      });
    }

    const reviews = await Review.find({ userID: req.user.id })
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
  }
};

// WRITE REVIEW
// Don't allow guest to write or use URL
const writeReview = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Please log in or sign up to write a review" });
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
      return res
        .status(400)
        .json({ message: "You have already reviewed this album" });
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
      return res
        .status(401)
        .json({ message: "You must be logged in to edit a review" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userID.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to edit this review" });
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
      return res
        .status(401)
        .json({ message: "You must be logged in to delete a review" });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.userID.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this review" });
    }

    await review.deleteOne();

    res.status(200).json({ message: "Review deleted successfully" });
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

module.exports = {
  getMyReviews,
  writeReview,
  updateReview,
  deleteReview,
  getAllReviews,
};
