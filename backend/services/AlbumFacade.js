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

  async getAlbumById(albumId) {
    try {
      const album = await Album.findById(albumId);

      if (!album) {
        throw new Error("Album not found");
      }

      return album;
    } catch (error) {
      Logger.error("Failed to retrieve album", error);
      throw error;
    }
  }

  async getAllAlbums(limit = 50, skip = 0) {
    try {
      const albums = await Album.find().limit(limit).skip(skip).sort({ createdAt: -1 });

      return albums;
    } catch (error) {
      Logger.error("Failed to retrieve all albums", error);
      throw error;
    }
  }

  async createAlbum(albumData) {
    try {
      const { title, artist, releaseYear, coverImageUrl } = albumData;

      if (!title || !artist) {
        throw new Error("Title and artist are required");
      }

      const album = await Album.create({
        title,
        artist,
        releaseYear,
        coverImageUrl,
      });

      Logger.info("Album created", { albumId: album._id });
      return album;
    } catch (error) {
      Logger.error("Failed to create album", error);
      throw error;
    }
  }
}

module.exports = new AlbumFacade();
