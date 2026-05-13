const AlbumFacade = require("../services/AlbumFacade");
const Logger = require("../utils/Logger");

const searchAlbums = async (req, res) => {
  try {
    const { q: query } = req.query;

    const albums = await AlbumFacade.searchAlbums(query);

    res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      data: albums,
    });
  } catch (error) {
    Logger.error("Search albums error", error);

    res.status(500).json({
      responseCode: "500",
      description: error.message,
      status: "Failed",
    });
  }
};

const getAlbumById = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(albumId)) {
      return res.status(408).json({
        responseCode: "408",
        description: "Album not found",
        status: "Failed",
      });
    }

    const album = await AlbumFacade.getAlbumById(albumId);

    if (!album) {
      return res.status(408).json({
        responseCode: "408",
        description: "Album not found",
        status: "Failed",
      });
    }

    res.status(200).json({
      responseCode: "200",
      description: "Successful",
      status: "Success",
      data: album,
    });
  } catch (error) {
    Logger.error("Get album by ID error", error);

    res.status(500).json({
      responseCode: "500",
      description: error.message,
      status: "Failed",
    });
  }
};

module.exports = { searchAlbums, getAlbumById };
