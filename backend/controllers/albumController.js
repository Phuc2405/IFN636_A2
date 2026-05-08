const Album = require("../models/Album");
const AlbumFacade = require("../services/AlbumFacade");

const Logger = require("../utils/Logger");

// const searchAlbums = async (req, res) => {
//   try {
//     const query = req.query.q;
//     if (!query || query.trim() === "") {
//       return res.status(200).json([]);
//     }
//     const searchTerm = query.trim();
//     const albums = await Album.find({
//       title: { $regex: searchTerm, $options: "i" },
//     });
//     res.status(200).json(albums);
//   } catch (error) {
//     console.error("Search error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };
// module.exports = { searchAlbums };

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

const getAlbumById = async (req, res) => {
  try {
    const { id: albumId } = req.params;

    const album = await AlbumFacade.getAlbumById(albumId);

    res.status(200).json({
      responseCode: "200",
      status: "Success",
      data: albums,
    });
  } catch (error) {
    Logger.error("Get album by ID error", error);

    res.status(500).json({
      responseCode: "500",
      status: "Failed",
      description: error,
    });
  }
};

const getAllAlbums = async (req, res) => {
  try {
    const { limit = 50, skip = 0 } = req.query;

    const albums = await AlbumFacade.getAllAlbums(parseInt(limit), parseInt(skip));

    res.status(200).json({
      responseCode: "200",
      status: "Success",
      data: albums,
    });
  } catch (error) {
    Logger.error("Get all albums error", error);

    res.status(500).json({
      responseCode: "500",
      status: "Failed",
      description: error,
    });
  }
};

const createAlbum = async (req, res) => {
  try {
    const albumData = req.body;

    const album = await AlbumFacade.createAlbum(albumData);

    res.status(200).json({
      responseCode: "200",
      status: "Success",
      data: albums,
    });
  } catch (error) {
    Logger.error("Create album error", error);

    res.status(500).json({
      responseCode: "500",
      status: "Failed",
      description: error,
    });
  }
};

module.exports = { searchAlbums, getAlbumById, getAllAlbums, createAlbum };
