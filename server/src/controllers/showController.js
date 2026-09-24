const Show = require('../models/Show');
const Theater = require('../models/Theater');

exports.getShows = async (req, res, next) => {
  try {
    const { movieId, theaterId, date, city } = req.query;
    let query = { isActive: true };

    if (movieId) query.movieId = movieId;
    if (theaterId) query.theaterId = theaterId;
    if (date) query.date = date;

    // Filter by city if theaterId is not directly supplied
    if (city && !theaterId) {
      const theatersInCity = await Theater.find({
        city: { $regex: new RegExp(`^${city}$`, 'i') },
        isActive: true,
      }).select('_id');
      const theaterIds = theatersInCity.map((t) => t._id);
      query.theaterId = { $in: theaterIds };
    }

    const shows = await Show.find(query)
      .populate('movieId', 'title posterUrl duration certificate language')
      .populate('theaterId', 'name city address facilities')
      .populate('screenId', 'screenNumber screenType totalSeats seatLayout')
      .sort({ date: 1, startTime: 1 });

    // Format response: if queried by movieId, group by theater for rich cinema scheduling view
    if (movieId && !theaterId) {
      const groupedByTheater = {};

      for (const show of shows) {
        const tId = show.theaterId._id.toString();
        if (!groupedByTheater[tId]) {
          groupedByTheater[tId] = {
            theater: show.theaterId,
            shows: [],
          };
        }
        groupedByTheater[tId].shows.push(show);
      }

      return res.status(200).json({
        success: true,
        count: shows.length,
        grouped: Object.values(groupedByTheater),
        data: shows,
      });
    }

    res.status(200).json({
      success: true,
      count: shows.length,
      data: shows,
    });
  } catch (error) {
    next(error);
  }
};

exports.getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movieId')
      .populate('theaterId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.status(200).json({ success: true, data: show });
  } catch (error) {
    next(error);
  }
};

exports.createShow = async (req, res, next) => {
  try {
    const show = await Show.create(req.body);
    const populated = await Show.findById(show._id)
      .populate('movieId')
      .populate('theaterId')
      .populate('screenId');

    res.status(201).json({ success: true, message: 'Show scheduled successfully', data: populated });
  } catch (error) {
    next(error);
  }
};

exports.updateShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('movieId')
      .populate('theaterId')
      .populate('screenId');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    res.status(200).json({ success: true, message: 'Show updated successfully', data: show });
  } catch (error) {
    next(error);
  }
};

exports.deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }
    res.status(200).json({ success: true, message: 'Show cancelled/archived successfully' });
  } catch (error) {
    next(error);
  }
};
