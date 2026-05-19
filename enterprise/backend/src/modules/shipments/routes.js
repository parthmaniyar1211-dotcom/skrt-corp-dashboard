const express = require('express');
const router = express.Router();
const { createShipment, getShipments, getShipmentById, updateStatus } = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
  .post(protect, authorize('admin', 'manager', 'operator'), createShipment)
  .get(protect, getShipments);

router.route('/:id')
  .get(protect, getShipmentById);

router.route('/:id/status')
  .patch(protect, authorize('admin', 'manager', 'operator'), updateStatus);

module.exports = router;
