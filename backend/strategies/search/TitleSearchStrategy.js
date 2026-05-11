const Album = require("../../models/Album");
const SearchStrategy = require("./SearchStrategy");

class TitleSearchStrategy extends SearchStrategy {
  async search(query) {
    return await Album.find({
      title: { $regex: query, $options: "i" },
    });
  }
}

module.exports = TitleSearchStrategy;
