const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const User = require('../models/User');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalMovies = await Movie.countDocuments({ isActive: true });
    const totalTheaters = await Theater.countDocuments({ isActive: true });
    const totalShows = await Show.countDocuments({ isActive: true });

    const bookings = await Booking.find({ bookingStatus: 'confirmed' });
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const totalTicketsSold = bookings.reduce((sum, b) => sum + (b.seats ? b.seats.length : 0), 0);

    // Recent 10 bookings
    const recentBookings = await Booking.find()
      .populate('userId', 'name email')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl' },
          { path: 'theaterId', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Revenue by movie
    const movieRevenueMap = {};
    for (const b of bookings) {
      if (b.showId) {
        const show = await Show.findById(b.showId).populate('movieId', 'title');
        if (show && show.movieId) {
          const title = show.movieId.title;
          movieRevenueMap[title] = (movieRevenueMap[title] || 0) + b.totalAmount;
        }
      }
    }

    const movieStats = Object.entries(movieRevenueMap)
      .map(([title, revenue]) => ({ title, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalMovies,
          totalTheaters,
          totalShows,
          totalBookings,
          totalRevenue,
          totalTicketsSold,
        },
        movieStats,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name email phone')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId', select: 'title posterUrl duration' },
          { path: 'theaterId', select: 'name city' },
          { path: 'screenId', select: 'screenNumber' },
        ],
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

exports.toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isBlocked = !user.isBlocked;
    // Invalidate refresh token if blocked
    if (user.isBlocked) {
      user.refreshToken = null;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: `User has been ${user.isBlocked ? 'suspended' : 'reactivated'}`,
      data: { id: user._id, isBlocked: user.isBlocked },
    });
  } catch (error) {
    next(error);
  }
};
