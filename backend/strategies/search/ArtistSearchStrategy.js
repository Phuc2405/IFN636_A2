const Album = require("../../models/Album");
const SearchStrategy = require("./SearchStrategy");

class ArtistSearchStrategy extends SearchStrategy {
  async search(query) {
    return await Album.find({
      artist: { $regex: query, $options: "i" },
    });
  }
}

module.exports = ArtistSearchStrategy;
