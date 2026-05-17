const Album = require("../../models/Album");
const SearchStrategy = require("./SearchStrategy");

class CombinedSearchStrategy extends SearchStrategy {
  async search(query) {
    return await Album.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { artist: { $regex: query, $options: "i" } }
      ],
    });
  }
}

module.exports = CombinedSearchStrategy;
