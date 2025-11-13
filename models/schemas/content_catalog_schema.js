const mongoose = require('mongoose');

const contentCatalogSchema = new mongoose.Schema({
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    genres: {
      type: [String],
      required: true
    },
    genre: {
      type: String, // primary genre
      required: true
    },
    likes: {
      type: Number,
      default: 0
    },
    type: {
      type: String,
      required: true,
      enum: ["movie", "series"]
    },
    image: {
      type: String,
      default: null
    }
}, {
    timestamps: true // adds createdAt, updatedAt
});

const ContentCatalog = mongoose.model('ContentCatalog', contentCatalogSchema);
module.exports = ContentCatalog;
