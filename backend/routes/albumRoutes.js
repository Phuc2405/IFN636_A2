const express = require("express");
const router = express.Router();

const { searchAlbums, getAlbumById } = require("../controllers/albumController");

// Search album by title
router.get("/search", searchAlbums);

// Get one album by ID
router.get("/:id", getAlbumById);

module.exports = router;
