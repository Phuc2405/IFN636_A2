const ReviewDeleteStrategy = require("./ReviewDeleteStrategy");

class UserDeleteReviewStrategy extends ReviewDeleteStrategy {
  async deleteReview(review, user) {
    if (review.userID.toString() !== user.id) {
      return {
        allowed: false,
        status: 403,
        message: "You are not allowed to delete this review",
      };
    }

    await review.deleteOne();

    return {
      allowed: true,
      status: 200,
      message: "Review deleted successfully",
    };
  }
}

module.exports = UserDeleteReviewStrategy;
