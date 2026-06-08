const express = require('express');
const router = express.Router();
const { generateShareLink } = require('./controller');
const { protect } = require('../../middleware/authMiddleware');

router.post('/generate-link', protect, generateShareLink);

module.exports = router;
