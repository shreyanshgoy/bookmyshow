const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

router.get('/', showController.getShows);
router.get('/:id', showController.getShowById);
router.post('/', authenticate, requireAdmin, showController.createShow);
router.put('/:id', authenticate, requireAdmin, showController.updateShow);
router.delete('/:id', authenticate, requireAdmin, showController.deleteShow);

module.exports = router;
