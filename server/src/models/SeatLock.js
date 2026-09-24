const mongoose = require('mongoose');

const seatLockSchema = new mongoose.Schema(
  {
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true,
    },
    seatNumber: {
      type: String,
      required: true,
      trim: true,
    },
    tier: {
      type: String,
      enum: ['Silver', 'Gold', 'Premium', 'Recliner'],
      default: 'Gold',
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['locked', 'booked'],
      default: 'locked',
      index: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound Unique Index: prevents duplicate lock/booking for the same show and seat
seatLockSchema.index({ showId: 1, seatNumber: 1 }, { unique: true });

// TTL index to automatically remove expired locks (status: 'locked' only)
// Note: booked seats should not expire, so we handle permanent bookings cleanly
module.exports = mongoose.model('SeatLock', seatLockSchema);
