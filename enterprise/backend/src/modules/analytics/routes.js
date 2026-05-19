const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { protect } = require('../../middleware/authMiddleware');

router.get('/dashboard', protect, controller.getDashboardStats);
router.get('/detailed', protect, controller.getDetailedAnalytics);

module.exports = router;
