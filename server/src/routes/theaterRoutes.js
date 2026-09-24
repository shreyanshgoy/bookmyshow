const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/cities', theaterController.getCities);
router.get('/', theaterController.getTheaters);
router.get('/:id', theaterController.getTheaterById);
router.post('/', authenticate, requireAdmin, theaterController.createTheater);
router.put('/:id', authenticate, requireAdmin, theaterController.updateTheater);
router.delete('/:id', authenticate, requireAdmin, theaterController.deleteTheater);

// Screen sub-routes
router.get('/:id/screens', theaterController.getScreensForTheater);
router.post('/:id/screens', authenticate, requireAdmin, theaterController.createScreen);

module.exports = router;
