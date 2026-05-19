const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('./controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.post('/login', login);
router.post('/register', protect, authorize('admin'), register);
router.get('/profile', protect, getProfile);

module.exports = router;
