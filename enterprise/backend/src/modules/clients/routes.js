const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient } = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
  .get(protect, getClients)
  .post(protect, authorize('admin', 'manager'), createClient);

router.route('/:id')
  .put(protect, authorize('admin', 'manager'), updateClient);

module.exports = router;
