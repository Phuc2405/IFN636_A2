const ReviewDeleteStrategy = require("./ReviewDeleteStrategy");

class AdminDeleteReviewStrategy extends ReviewDeleteStrategy {
  async deleteReview(review) {
    await review.deleteOne();

    return {
      allowed: true,
      status: 200,
      message: "Review deleted successfully",
    };
  }
}

module.exports = AdminDeleteReviewStrategy;
