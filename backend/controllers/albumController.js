const Album = require("../models/Album");
const AlbumFacade = require("../services/AlbumFacade");

const Logger = require("../utils/Logger");

const searchAlbums = async (req, res) => {
  try {
    const { q: query } = req.query;

    const albums = await AlbumFacade.searchAlbums(query);

    res.status(200).json({
      responseCode: "200",
      status: "Success",
      data: albums,
    });
  } catch (error) {
    Logger.error("Search albums error", error);

    res.status(500).json({
      responseCode: "500",
      status: "Failed",
      description: error,
    });
  }
};

module.exports = { searchAlbums };
