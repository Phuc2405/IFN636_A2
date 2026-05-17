const TitleSearchStrategy = require("../strategies/search/TitleSearchStrategy");
const ArtistSearchStrategy = require("../strategies/search/ArtistSearchStrategy");
const CombinedAlbumSearchStrategy = require("../strategies/search/CombinedAlbumSearchStrategy");

class SearchStrategyFactory {
  static createStrategy(searchType = "combined") {
    switch (searchType.toLowerCase()) {
      case "title":
        return new TitleSearchStrategy();
      case "artist":
        return new ArtistSearchStrategy();
      case "combined":
      default:
        return new CombinedAlbumSearchStrategy();
    }
  }
}

module.exports = SearchStrategyFactory;
