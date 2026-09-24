const Movie = require('../models/Movie');
const Show = require('../models/Show');
const Theater = require('../models/Theater');

exports.getMovies = async (req, res, next) => {
  try {
    const { search, genre, language, city, status } = req.query;
    let query = { isActive: true };

    if (status === 'upcoming') {
      query.isUpcoming = true;
    } else if (status === 'now-showing') {
      query.isUpcoming = false;
    }

    if (genre) {
      const genres = genre.split(',').map((g) => g.trim());
      query.genre = { $in: genres };
    }

    if (language) {
      const languages = language.split(',').map((l) => l.trim());
      query.language = { $in: languages };
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // If city is specified, filter to movies currently showing in theaters in that city
    if (city) {
      const theatersInCity = await Theater.find({ city: { $regex: new RegExp(`^${city}$`, 'i') }, isActive: true }).select('_id');
      const theaterIds = theatersInCity.map((t) => t._id);

      const showsInCity = await Show.find({ theaterId: { $in: theaterIds }, isActive: true }).select('movieId');
      const movieIds = [...new Set(showsInCity.map((s) => s.movieId.toString()))];

      if (query.isUpcoming !== true) {
        query._id = { $in: movieIds };
      }
    }

    const movies = await Movie.find(query).sort({ releaseDate: -1, rating: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMovieById = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

exports.createMovie = async (req, res, next) => {
  try {
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, message: 'Movie created successfully', data: movie });
  } catch (error) {
    next(error);
  }
};

exports.updateMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie updated successfully', data: movie });
  } catch (error) {
    next(error);
  }
};

exports.deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }
    res.status(200).json({ success: true, message: 'Movie archived successfully' });
  } catch (error) {
    next(error);
  }
};
