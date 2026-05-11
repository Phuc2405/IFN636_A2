const express = require("express");
const router = express.Router();

const { searchAlbums, getAlbumById, getAllAlbums, createAlbum } = require("../controllers/albumController");

const { protect } = require("../middleware/authMiddleware");

// Search album by title
router.get("/search", searchAlbums);

// Get all albums
router.get("/", protect, getAllAlbums);

// Get one album by ID
router.get("/:id", protect, getAlbumById);

// Create album
router.post("/", protect, createAlbum);

module.exports = router;
