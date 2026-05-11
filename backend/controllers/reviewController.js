const Review = require("../models/Review");
const Album = require("../models/Album");
const { response } = require("../server");

// GET MY REVIEWS (authenticated user only)
const getMyReviews = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }

    const reviews = await Review.find({ userID: req.user.id })
      .populate("albumID", "_id title artist coverImageUrl")
      .populate("userID", "nickname")
      .sort({ createdAt: -1 });

    return res.json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      totalReviews: reviews.length,
      data: reviews.map((r) => ({
        reviewID: r._id,
        albumTitle: r.albumID?.title,
        albumID: r.albumID?._id,
        artist: r.albumID?.artist,
        coverImageUrl: r.albumID?.coverImageUrl,
        reviewRate: r.reviewRate,
        reviewContent: r.reviewContent,
        createdAt: r.reviewDate,
        updateAt: r.updateAt,
      })),
    });
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
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }

    const { albumTitle, artistName, reviewRate, reviewContent } = req.body;
    const missing = [];
    if (!albumTitle) missing.push("albumTitle");
    if (!artistName) missing.push("artistName");
    if (!reviewRate) missing.push("reviewRate");
    if (!reviewContent) missing.push("reviewContent");
    if (missing.length > 0) {
      return res.status(400).json({
        responseCode: "400",
        description: `Missing required fields`,
        status: "Failed",
        missingFields: missing.map((field) => ({
          errorField: field,
          errorMessage: `${field} is required`,
        })),
      });
    }
    if (reviewRate < 1 || reviewRate > 5) {
      return res.status(411).json({
        responseCode: "411",
        description: "reviewRate must be between 1 and 5",
        status: "Failed",
      });
    }
    const album = await Album.findOne({
      title: albumTitle,
      artist: artistName,
    });
    if (!album) {
      return res.status(408).json({
        responseCode: "408",
        description: "Album not found",
        status: "Failed",
      });
    }

    // Check if user has already reviewed this album
    const existingReview = await Review.findOne({
      userID: req.user.id,
      albumID: album._id,
    });
    if (existingReview) {
      return res.status(410).json({
        responseCode: "410",
        description: "You have already reviewed this album",
        status: "Failed",
      });
    }

    const review = await Review.create({
      albumID: album._id,
      userID: req.user.id,
      reviewRate,
      reviewContent,
    });

    const populatedReview = await Review.findById(review._id)
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname")
      .lean();

    return res.status(201).json({
      responseCode: "201",
      description: "Created successfully",
      status: "Success",
      data: {
        reviewID: populatedReview._id,
        albumID: populatedReview.albumID?._id,
        albumTitle: populatedReview.albumID?.title,
        artist: populatedReview.albumID?.artist,
        coverImageUrl: populatedReview.albumID?.coverImageUrl,
        reviewRate: populatedReview.reviewRate,
        reviewContent: populatedReview.reviewContent,
        createdAt: populatedReview.reviewDate,
        updateAt: populatedReview.updateAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
  }
};

// EDIT REVIEW
// Only user own the review and logged in can edit
const updateReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(404).json({
        responseCode: "404",
        description: "Review not found",
        status: "Failed",
      });
    }
    const { reviewRate, reviewContent } = req.body;
    const missing = [];
    if (reviewRate === undefined) missing.push("reviewRate");
    if (reviewContent === undefined) missing.push("reviewContent");
    if (missing.length > 0) {
      return res.status(400).json({
        responseCode: "400",
        description: `Missing required fields`,
        status: "Failed",
        missingFields: missing.map((field) => ({
          errorField: field,
          errorMessage: `${field} is required`,
        })),
      });
    }

    // Validate reviewRate if provided
    if (reviewRate < 1 || reviewRate > 5) {
      return res.status(411).json({
        responseCode: "411",
        description: "reviewRate must be between 1 and 5",
        status: "Failed",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        responseCode: "404",
        description: "Review not found",
        status: "Failed",
      });
    }

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({
        responseCode: "403",
        description: "You are not allowed to do this action",
        status: "Failed",
      });
    }

    review.reviewRate = reviewRate;
    review.reviewContent = reviewContent;
    await review.save(); // Update at auto update time

    const populatedReview = await Review.findById(review._id)
      .populate("albumID", "title artist coverImageUrl")
      .populate("userID", "nickname");

    return res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      data: {
        reviewID: populatedReview._id,
        albumTitle: populatedReview.albumID?.title,
        artist: populatedReview.albumID?.artist,
        coverImageUrl: populatedReview.albumID?.coverImageUrl,
        reviewRate: populatedReview.reviewRate,
        reviewContent: populatedReview.reviewContent,
        createdAt: populatedReview.reviewDate,
        updateAt: populatedReview.updateAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
  }
};

// DELETE REVIEW
// Only user own the review and logged in can delete
const deleteReview = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }

    if (!/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      return res.status(404).json({
        responseCode: "404",
        description: "Review not found",
        status: "Failed",
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        responseCode: "404",
        description: "Review not found",
        status: "Failed",
      });
    }

    if (review.userID.toString() !== req.user.id) {
      return res.status(403).json({
        responseCode: "403",
        description: "You are not allowed to do this action",
        status: "Failed",
      });
    }

    await review.deleteOne();

    return res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
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
    if (!req.user) {
      return res.status(401).json({
        responseCode: "401",
        description: "Invalid or expired token",
        status: "Failed",
      });
    }
    if (req.user.type !== "admin") {
      return res.status(403).json({
        responseCode: "403",
        description: "You are not allowed to do this action",
        status: "Failed",
      });
    }
    const reviews = await Review.find()
      .populate("albumID", "_id title artist coverImageUrl")
      .populate("userID", "nickname email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      totalReviews: reviews.length,
      data: reviews.map((r) => ({
        reviewID: r._id,
        albumTitle: r.albumID?.title,
        artist: r.albumID?.artist,
        albumID: r.albumID?._id,
        coverImageUrl: r.albumID?.coverImageUrl,
        reviewRate: r.reviewRate,
        reviewContent: r.reviewContent,
        createdAt: r.reviewDate,
        updateAt: r.updateAt,
        user: {
          nickname: r.userID?.nickname,
          email: r.userID?.email,
          type: r.userID?.type,
        },
      })),
    });
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: "Internal server error",
      status: "Failed",
    });
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
