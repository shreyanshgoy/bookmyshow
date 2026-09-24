const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true,
      index: true,
    },
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
      index: true,
    },
    screenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Screen',
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
      index: true,
    },
    startTime: {
      type: String, // e.g. "10:30 AM"
      required: true,
    },
    endTime: {
      type: String, // e.g. "01:15 PM"
      default: '',
    },
    language: {
      type: String,
      default: 'English',
    },
    format: {
      type: String,
      enum: ['2D', '3D', 'IMAX 2D', 'IMAX 3D', '4DX'],
      default: '2D',
    },
    pricing: {
      Silver: { type: Number, default: 160 },
      Gold: { type: Number, default: 220 },
      Premium: { type: Number, default: 320 },
      Recliner: { type: Number, default: 480 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Compound index for querying shows by movie, date, and theater
showSchema.index({ movieId: 1, date: 1, theaterId: 1 });

module.exports = mongoose.model('Show', showSchema);
