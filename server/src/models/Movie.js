const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Movie description is required'],
    },
    genre: {
      type: [String],
      required: [true, 'At least one genre is required'],
      index: true,
    },
    language: {
      type: [String],
      required: [true, 'At least one language is required'],
      index: true,
    },
    duration: {
      type: Number, // In minutes
      required: [true, 'Movie duration in minutes is required'],
    },
    releaseDate: {
      type: Date,
      required: [true, 'Release date is required'],
    },
    posterUrl: {
      type: String,
      required: [true, 'Poster image URL is required'],
    },
    bannerUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    rating: {
      type: Number,
      default: 8.0,
      min: 0,
      max: 10,
    },
    votes: {
      type: Number,
      default: 100,
    },
    director: {
      type: String,
      default: '',
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'R', 'PG-13'],
      default: 'UA',
    },
    casts: [
      {
        name: { type: String, required: true },
        role: { type: String, default: 'Actor' },
        photoUrl: { type: String, default: '' },
      },
    ],
    isUpcoming: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Text index for search with language_override set to 'none' so 'language' field array doesn't collide
movieSchema.index({ title: 'text', description: 'text' }, { language_override: 'none' });

module.exports = mongoose.model('Movie', movieSchema);
