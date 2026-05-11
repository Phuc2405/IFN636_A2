const AlbumSearchStrategyFactory = require("../factories/AlbumSearchStrategyFactory");
const Album = require("../models/Album");
const Logger = require("../utils/Logger");

class AlbumFacade {
  async searchAlbums(query) {
    try {
      if (!query || query.trim() === "") {
        return [];
      }

      // ONLY use combined strategy, easier to extend the feature
      const strategy = AlbumSearchStrategyFactory.createStrategy("combined");
      const results = await strategy.search(query.trim());

      Logger.info("Album search completed", { query, count: results.length });

      return results;
    } catch (error) {
      Logger.error("Album search failed", error);
      throw error;
    }
  }
}

module.exports = new AlbumFacade();
