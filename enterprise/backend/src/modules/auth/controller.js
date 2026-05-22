const User = require('./model');
const generateToken = require('../../utils/generateToken');
const sendResponse = require('../../utils/response');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  console.log('\n🔐 [LOGIN] ── Login attempt ───────────────────────');
  console.log('   Email received   :', email);
  console.log('   Password received:', password ? '(provided)' : '(missing)');

  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      console.log('⚠️ MongoDB is not connected. Attempting Mock Login bypass.');
      if (email === 'admin@ttc.com' && password === 'password123') {
        const mockUserId = new mongoose.Types.ObjectId();
        const token = generateToken(mockUserId);
        console.log('   JWT generated (Mock Mode): ✅ Yes');
        console.log('────────────────────────────────────────────────────\n');
        return sendResponse(res, 200, true, 'Login successful (Mock Mode)', {
          _id:   mockUserId,
          name:  'Administrator',
          email: 'admin@ttc.com',
          role:  'admin',
          token
        });
      } else {
        console.log('   ❌ Login failed (Mock Mode) — invalid credentials.');
        return sendResponse(res, 401, false, 'Invalid email or password');
      }
    }

    // Step 1: Find user by email and explicitly include password field
    const user = await User.findOne({ email }).select('+password');

    console.log('   User found in DB  :', user ? `✅ Yes (role: ${user.role})` : '❌ No');

    if (!user) {
      console.log('   ❌ Login failed — no user with that email.');
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    // Step 2: Compare entered password with hashed password in DB
    const isMatch = await user.matchPassword(password);
    console.log('   Password match    :', isMatch ? '✅ Yes' : '❌ No');

    if (!isMatch) {
      console.log('   ❌ Login failed — password mismatch.');
      return sendResponse(res, 401, false, 'Invalid email or password');
    }

    // Step 3: Generate JWT and return success response
    const token = generateToken(user._id);
    console.log('   JWT generated     : ✅ Yes');
    console.log('────────────────────────────────────────────────────\n');

    return sendResponse(res, 200, true, 'Login successful', {
      _id:   user._id,
      name:  user.name,
      email: user.email,
      role:  user.role,
      token
    });
  } catch (error) {
    console.error('   ❌ Login error:', error.message);
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Admin
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return sendResponse(res, 400, false, 'User already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      role
    });

    if (user) {
      return sendResponse(res, 201, true, 'User registered successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      return sendResponse(res, 400, false, 'Invalid user data');
    }
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const isDbConnected = mongoose.connection.readyState === 1;

    if (!isDbConnected) {
      return sendResponse(res, 200, true, 'Profile fetched successfully (Mock Mode)', {
        _id: req.user._id,
        name: 'Administrator',
        email: 'admin@ttc.com',
        role: 'admin'
      });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      return sendResponse(res, 200, true, 'Profile fetched successfully', {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    } else {
      return sendResponse(res, 404, false, 'User not found');
    }
  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};
