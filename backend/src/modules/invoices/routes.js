const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, getSummaryBill, getDsBill, getCombinedBill } = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.route('/')
  .get(protect, getInvoices)
  .post(protect, authorize('admin', 'manager', 'operator'), createInvoice);

router.get('/summary-bill', protect, getSummaryBill);
router.get('/ds-bill', protect, getDsBill);
router.get('/combined-bill', protect, getCombinedBill);

module.exports = router;
