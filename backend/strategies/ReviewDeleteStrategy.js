class ReviewDeleteStrategy {
  async deleteReview() {
    throw new Error("deleteReview must be implemented by a concrete strategy");
  }
}

module.exports = ReviewDeleteStrategy;
