const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    theaterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theater',
      required: true,
      index: true,
    },
    screenNumber: {
      type: String,
      required: true,
    },
    screenType: {
      type: String,
      enum: ['Standard', 'IMAX 2D', 'IMAX 3D', '4DX', 'Dolby Cinema', 'Gold Class'],
      default: 'Dolby Cinema',
    },
    soundSystem: {
      type: String,
      default: 'Dolby Atmos 7.1 Surround Sound',
    },
    seatLayout: {
      rows: {
        type: [String],
        default: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      },
      columns: {
        type: Number,
        default: 12,
      },
      aisles: {
        type: [Number],
        default: [3, 9], // gaps after seat 3 and seat 9
      },
      tiers: [
        {
          name: {
            type: String,
            enum: ['Recliner', 'Premium', 'Gold', 'Silver'],
            required: true,
          },
          rows: {
            type: [String],
            required: true,
          },
        },
      ],
    },
    totalSeats: {
      type: Number,
      default: 96,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Screen', screenSchema);
