const Booking = require('../models/Booking');
const SeatLock = require('../models/SeatLock');
const Show = require('../models/Show');
const User = require('../models/User');
const { generateQRCode } = require('../services/qrService');
const { sendBookingConfirmation } = require('../services/emailService');
const { emitSeatBooked, emitSeatReleased } = require('../config/socket');

const CONVENIENCE_FEE_PER_TICKET = 30; // ₹30 base fee per ticket
const GST_RATE = 0.18; // 18% GST on convenience fee

exports.createBooking = async (req, res, next) => {
  try {
    const { showId, seats, paymentMethod, paymentTransactionId } = req.body;
    const userId = req.user.id;

    if (!showId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide showId and selected seats' });
    }

    const show = await Show.findById(showId)
      .populate('movieId')
      .populate('theaterId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    const seatNumbers = seats.map((s) => s.seatNumber);
    const now = new Date();

    // Verify each seat is currently locked by this user and hasn't expired
    const activeLocks = await SeatLock.find({
      showId,
      seatNumber: { $in: seatNumbers },
      lockedBy: userId,
      status: 'locked',
      expiresAt: { $gt: now },
    });

    if (activeLocks.length !== seats.length) {
      return res.status(409).json({
        success: false,
        message: 'One or more seat reservations have expired or are no longer valid. Please re-select your seats.',
      });
    }

    // Compute pricing
    const subtotal = seats.reduce((sum, s) => sum + Number(s.price), 0);
    const rawFee = seats.length * CONVENIENCE_FEE_PER_TICKET;
    const convenienceFee = Math.round(rawFee * (1 + GST_RATE));
    const totalAmount = subtotal + convenienceFee;

    // Generate unique human-readable booking ID
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const bookingId = `BMS-${Date.now().toString().slice(-6)}-${randomSuffix}`;

    // Generate Scannable QR Code
    const qrData = {
      bookingId,
      movie: show.movieId?.title,
      theater: show.theaterId?.name,
      showTime: `${show.date} ${show.startTime}`,
      seats: seatNumbers,
      totalAmount,
      bookedBy: req.user.name,
    };
    const qrCode = await generateQRCode(qrData);

    // Create the confirmed booking
    const booking = await Booking.create({
      bookingId,
      userId,
      showId,
      seats,
      subtotal,
      convenienceFee,
      totalAmount,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'UPI',
      transactionId: paymentTransactionId || `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      qrCode,
      bookingStatus: 'confirmed',
    });

    // Atomically convert all locked seats to permanently booked
    await SeatLock.updateMany(
      {
        showId,
        seatNumber: { $in: seatNumbers },
        lockedBy: userId,
        status: 'locked',
      },
      {
        status: 'booked',
        bookingId: booking._id,
      }
    );

    // Broadcast live update: seats permanently booked!
    emitSeatBooked(showId, seatNumbers);

    // Send confirmation email asynchronously (won't block HTTP response)
    User.findById(userId).then((user) => {
      if (user) {
        sendBookingConfirmation(user, booking, show, show.movieId, show.theaterId);
      }
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl duration certificate language' },
          { path: 'theaterId', select: 'name city address' },
          { path: 'screenId', select: 'screenNumber screenType' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId' },
          { path: 'theaterId' },
          { path: 'screenId' },
        ],
      });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization: must be the booking owner or admin
    if (booking.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied to this booking' });
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('showId');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Mark booking as cancelled
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    await booking.save();

    // Release the booked seats so other users can book them
    const seatNumbers = booking.seats.map((s) => s.seatNumber);
    await SeatLock.deleteMany({
      showId: booking.showId._id,
      seatNumber: { $in: seatNumbers },
      status: 'booked',
    });

    // Broadcast released seats
    for (const seatNum of seatNumbers) {
      emitSeatReleased(booking.showId._id.toString(), seatNum);
    }

    res.status(200).json({
      success: true,
      message: 'Booking cancelled and seats released. Refund initiated.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};
