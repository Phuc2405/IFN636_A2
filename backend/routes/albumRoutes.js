const express = require("express");
const router = express.Router();

const { searchAlbums, getAlbumById } = require("../controllers/albumController");

const { protect } = require("../middleware/authMiddleware");

// Search album by title
router.get("/search", searchAlbums);

// Get one album by ID
router.get("/:id", protect, getAlbumById);

module.exports = router;
