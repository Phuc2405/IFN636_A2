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
      description: error.message,
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    const album = await AlbumFacade.getAlbumById(albumId);

    if (!album) {
      return res.status(404).json({
        responseCode: "404",
        status: "Failed",
        description: "Album not found",
      });
    }

    res.status(200).json({
      responseCode: "200",
      status: "Success",
      data: album,
    });
  } catch (error) {
    Logger.error("Get album by ID error", error);

    res.status(500).json({
      responseCode: "500",
      status: "Failed",
      description: error.message,
    });
  }
};

module.exports = { searchAlbums, getAlbumById };
