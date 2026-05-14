const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewRate: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    reviewContent: {
      type: String,
      required: true,
    },

    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    albumID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: "reviewDate",
      updatedAt: "updateAt",
    },
  }
);

module.exports = mongoose.model("Review", reviewSchema);
