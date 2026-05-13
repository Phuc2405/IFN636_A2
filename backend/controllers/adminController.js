const Review = require("../models/Review");

const deleteReviewByAdmin = async (req, res) => {
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

    await review.deleteOne();

    return res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
    });
  } catch (error) {
    res.status(500).json({
      responseCode: "500",
      description: error.message,
      status: "Failed",
    });
  }
};

module.exports = { deleteReviewByAdmin };
