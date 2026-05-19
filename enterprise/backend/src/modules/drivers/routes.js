const express = require('express');
const router = express.Router();
const { getDrivers, getDriverById, createDriver } = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
  .get(protect, getDrivers)
  .post(protect, authorize('admin', 'manager'), createDriver);

router.get('/:id', protect, getDriverById);

module.exports = router;
