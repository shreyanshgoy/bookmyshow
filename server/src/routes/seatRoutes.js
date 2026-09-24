const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/show/:showId', optionalAuth, seatController.getSeatMap);
router.post('/lock', authenticate, seatController.lockSeat);
router.post('/release', authenticate, seatController.releaseSeat);
router.post('/release-all', authenticate, seatController.releaseAllUserLocks);

module.exports = router;
