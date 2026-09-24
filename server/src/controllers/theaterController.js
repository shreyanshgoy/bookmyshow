const Theater = require('../models/Theater');
const Screen = require('../models/Screen');

exports.getTheaters = async (req, res, next) => {
  try {
    const { city } = req.query;
    let query = { isActive: true };

    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, 'i') };
    }

    const theaters = await Theater.find(query).sort({ name: 1 });
    res.status(200).json({ success: true, count: theaters.length, data: theaters });
  } catch (error) {
    next(error);
  }
};

exports.getCities = async (req, res, next) => {
  try {
    const cities = await Theater.distinct('city', { isActive: true });
    res.status(200).json({ success: true, data: cities });
  } catch (error) {
    next(error);
  }
};

exports.getTheaterById = async (req, res, next) => {
  try {
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    const screens = await Screen.find({ theaterId: theater._id, isActive: true });
    res.status(200).json({ success: true, data: { ...theater.toObject(), screens } });
  } catch (error) {
    next(error);
  }
};

exports.createTheater = async (req, res, next) => {
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json({ success: true, message: 'Theater created successfully', data: theater });
  } catch (error) {
    next(error);
  }
};

exports.updateTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    res.status(200).json({ success: true, message: 'Theater updated successfully', data: theater });
  } catch (error) {
    next(error);
  }
};

exports.deleteTheater = async (req, res, next) => {
  try {
    const theater = await Theater.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }
    res.status(200).json({ success: true, message: 'Theater archived successfully' });
  } catch (error) {
    next(error);
  }
};

// Screen Management
exports.getScreensForTheater = async (req, res, next) => {
  try {
    const screens = await Screen.find({ theaterId: req.params.id, isActive: true });
    res.status(200).json({ success: true, data: screens });
  } catch (error) {
    next(error);
  }
};

exports.createScreen = async (req, res, next) => {
  try {
    const { screenNumber, screenType, soundSystem, seatLayout, totalSeats } = req.body;
    const theater = await Theater.findById(req.params.id);
    if (!theater) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    const screen = await Screen.create({
      theaterId: theater._id,
      screenNumber,
      screenType: screenType || 'Dolby Cinema',
      soundSystem: soundSystem || 'Dolby Atmos 7.1',
      seatLayout: seatLayout || undefined,
      totalSeats: totalSeats || 96,
    });

    res.status(201).json({ success: true, message: 'Screen created successfully', data: screen });
  } catch (error) {
    next(error);
  }
};
