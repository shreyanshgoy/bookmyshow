const SeatLock = require('../models/SeatLock');

const LOCK_DURATION_MS = (parseInt(process.env.SEAT_LOCK_DURATION_MINUTES, 10) || 10) * 60 * 1000;

/**
 * Retrieve current seat status map for a show, cleaning up any expired locks.
 */
const getSeatMapForShow = async (showId) => {
  const now = new Date();

  // Find all active seat locks or bookings
  const seats = await SeatLock.find({ showId }).lean();

  const seatMap = {};
  const expiredSeatNumbers = [];

  for (const seat of seats) {
    if (seat.status === 'booked') {
      seatMap[seat.seatNumber] = {
        status: 'booked',
        seatNumber: seat.seatNumber,
        tier: seat.tier,
      };
    } else if (seat.status === 'locked') {
      if (new Date(seat.expiresAt) > now) {
        seatMap[seat.seatNumber] = {
          status: 'locked',
          seatNumber: seat.seatNumber,
          tier: seat.tier,
          lockedBy: seat.lockedBy.toString(),
          expiresAt: seat.expiresAt,
        };
      } else {
        // Expired lock
        expiredSeatNumbers.push(seat.seatNumber);
      }
    }
  }

  // Asynchronously clean up expired locks from database
  if (expiredSeatNumbers.length > 0) {
    await SeatLock.deleteMany({
      showId,
      seatNumber: { $in: expiredSeatNumbers },
      status: 'locked',
    });
  }

  return { seatMap, expiredSeatNumbers };
};

/**
 * Concurrency-safe atomic lock for a single seat
 */
const lockSeat = async (showId, seatNumber, tier, price, userId) => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_DURATION_MS);

  // First, check if existing lock exists
  const existing = await SeatLock.findOne({ showId, seatNumber });

  if (existing) {
    if (existing.status === 'booked') {
      const err = new Error('This seat is already booked.');
      err.statusCode = 409;
      throw err;
    }

    if (existing.status === 'locked' && new Date(existing.expiresAt) > now) {
      if (existing.lockedBy.toString() === userId.toString()) {
        // Already locked by this user, refresh expiration timer
        existing.expiresAt = expiresAt;
        await existing.save();
        return existing;
      } else {
        const err = new Error('This seat is currently held by another user.');
        err.statusCode = 409;
        throw err;
      }
    }

    // Existing lock is expired; atomically take over
    const updated = await SeatLock.findOneAndUpdate(
      {
        showId,
        seatNumber,
        status: 'locked',
        expiresAt: existing.expiresAt, // ensure no one else modified it in between
      },
      {
        lockedBy: userId,
        tier,
        price,
        lockedAt: now,
        expiresAt,
        status: 'locked',
      },
      { new: true }
    );

    if (!updated) {
      const err = new Error('Seat acquisition conflict. Please try again.');
      err.statusCode = 409;
      throw err;
    }
    return updated;
  }

  // No record exists: create new lock
  try {
    const newLock = await SeatLock.create({
      showId,
      seatNumber,
      tier,
      price,
      lockedBy: userId,
      lockedAt: now,
      expiresAt,
      status: 'locked',
    });
    return newLock;
  } catch (err) {
    // If concurrent insert occurred, MongoDB triggers unique index constraint error (code 11000)
    if (err.code === 11000) {
      const conflictErr = new Error('This seat was just selected by another user.');
      conflictErr.statusCode = 409;
      throw conflictErr;
    }
    throw err;
  }
};

/**
 * Release a locked seat by the user who locked it
 */
const releaseSeat = async (showId, seatNumber, userId) => {
  const deleted = await SeatLock.findOneAndDelete({
    showId,
    seatNumber,
    lockedBy: userId,
    status: 'locked',
  });
  return !!deleted;
};

/**
 * Release all locks held by a user for a specific show
 */
const releaseAllUserLocks = async (showId, userId) => {
  const result = await SeatLock.deleteMany({
    showId,
    lockedBy: userId,
    status: 'locked',
  });
  return result.deletedCount;
};

/**
 * Background janitor function: purges expired locks and returns showId and seat numbers
 */
const purgeExpiredLocks = async () => {
  const now = new Date();
  const expired = await SeatLock.find({
    status: 'locked',
    expiresAt: { $lt: now },
  }).select('showId seatNumber');

  if (expired.length > 0) {
    const ids = expired.map((e) => e._id);
    await SeatLock.deleteMany({ _id: { $in: ids } });
  }

  return expired;
};

module.exports = {
  getSeatMapForShow,
  lockSeat,
  releaseSeat,
  releaseAllUserLocks,
  purgeExpiredLocks,
  LOCK_DURATION_MS,
};
