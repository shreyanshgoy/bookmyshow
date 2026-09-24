const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);
router.post('/', authenticate, requireAdmin, movieController.createMovie);
router.put('/:id', authenticate, requireAdmin, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieController.deleteMovie);

module.exports = router;
