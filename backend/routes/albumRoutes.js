const express = require("express");
const router = express.Router();

const { searchAlbums } = require("../controllers/albumController");

// Search album by title
router.get("/search", searchAlbums);

module.exports = router;
