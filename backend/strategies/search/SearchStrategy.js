class SearchStrategy {
  async search(query) {
    throw new Error("search() must be implemented");
  }
}

module.exports = SearchStrategy;
