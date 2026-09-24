const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');

// Protect all admin routes
router.use(authenticate, requireAdmin);

router.get('/stats', adminController.getDashboardStats);
router.get('/bookings', adminController.getAllBookings);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/toggle-block', adminController.toggleUserBlock);

module.exports = router;
