const Show = require('../models/Show');
const seatLockService = require('../services/seatLockService');
const { emitSeatLocked, emitSeatReleased } = require('../config/socket');

exports.getSeatMap = async (req, res, next) => {
  try {
    const { showId } = req.params;
    const currentUserId = req.user ? req.user.id.toString() : null;

    const show = await Show.findById(showId)
      .populate('movieId', 'title posterUrl duration certificate')
      .populate('theaterId', 'name city address')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const { seatMap, expiredSeatNumbers } = await seatLockService.getSeatMapForShow(showId);

    // Notify room if any expired locks were cleaned up
    if (expiredSeatNumbers.length > 0) {
      for (const seatNum of expiredSeatNumbers) {
        emitSeatReleased(showId, seatNum);
      }
    }

    // Enhance seatMap for the requesting user (mark if locked by them vs someone else)
    const formattedSeatMap = {};
    for (const [seatNumber, data] of Object.entries(seatMap)) {
      formattedSeatMap[seatNumber] = {
        ...data,
        isMine: currentUserId ? data.lockedBy === currentUserId : false,
      };
    }

    res.status(200).json({
      success: true,
      data: {
        show: {
          id: show._id,
          movie: show.movieId,
          theater: show.theaterId,
          screen: show.screenId,
          date: show.date,
          startTime: show.startTime,
          pricing: show.pricing,
          format: show.format,
          language: show.language,
        },
        seatMap: formattedSeatMap,
        lockDurationMinutes: parseInt(process.env.SEAT_LOCK_DURATION_MINUTES, 10) || 10,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.lockSeat = async (req, res, next) => {
  try {
    const { showId, seatNumber, tier, price } = req.body;
    const userId = req.user.id;

    if (!showId || !seatNumber || !tier || price === undefined) {
      return res.status(400).json({ success: false, message: 'showId, seatNumber, tier, and price are required' });
    }

    const lock = await seatLockService.lockSeat(showId, seatNumber, tier, price, userId);

    // Broadcast to everyone else in this show room that this seat is now locked
    emitSeatLocked(showId, {
      seatNumber,
      tier,
      lockedBy: userId.toString(),
      expiresAt: lock.expiresAt,
    });

    res.status(200).json({
      success: true,
      message: `Seat ${seatNumber} temporarily reserved`,
      data: {
        seatNumber: lock.seatNumber,
        tier: lock.tier,
        price: lock.price,
        lockedBy: lock.lockedBy,
        expiresAt: lock.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.releaseSeat = async (req, res, next) => {
  try {
    const { showId, seatNumber } = req.body;
    const userId = req.user.id;

    if (!showId || !seatNumber) {
      return res.status(400).json({ success: false, message: 'showId and seatNumber are required' });
    }

    const released = await seatLockService.releaseSeat(showId, seatNumber, userId);

    if (released) {
      emitSeatReleased(showId, seatNumber);
    }

    res.status(200).json({
      success: true,
      message: released ? `Seat ${seatNumber} released` : 'Seat was not locked by you',
    });
  } catch (error) {
    next(error);
  }
};

exports.releaseAllUserLocks = async (req, res, next) => {
  try {
    const { showId } = req.body;
    const userId = req.user.id;

    if (!showId) {
      return res.status(400).json({ success: false, message: 'showId is required' });
    }

    // Get current locks for this user to broadcast individual releases
    const SeatLock = require('../models/SeatLock');
    const userLocks = await SeatLock.find({ showId, lockedBy: userId, status: 'locked' }).select('seatNumber');

    await seatLockService.releaseAllUserLocks(showId, userId);

    for (const lock of userLocks) {
      emitSeatReleased(showId, lock.seatNumber);
    }

    res.status(200).json({
      success: true,
      message: `Released ${userLocks.length} seats`,
    });
  } catch (error) {
    next(error);
  }
};
