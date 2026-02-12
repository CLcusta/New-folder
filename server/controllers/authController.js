const User = require('../models/User');
const Vendor = require('../models/Vendor');
const { generateToken } = require('../config/jwt');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { AppError } = require('../utils/errorHandler');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
    });

    // If vendor role, create vendor profile
    if (user.role === 'vendor' && req.body.vendorInfo) {
      await Vendor.create({
        user: user._id,
        businessName: req.body.vendorInfo.businessName,
        location: req.body.vendorInfo.location,
        contactInfo: req.body.vendorInfo.contactInfo,
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    sendSuccess(res, 201, { user, token }, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 403, 'Account has been deactivated');
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    // Remove password from response
    user.password = undefined;

    sendSuccess(res, 200, { user, token }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    // If vendor, include vendor profile
    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user: user._id });
      return sendSuccess(res, 200, { user, vendor }, 'User profile retrieved');
    }

    sendSuccess(res, 200, { user }, 'User profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true, runValidators: true }
    );

    sendSuccess(res, 200, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password
 * @route   PUT /api/auth/password
 * @access  Private
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 401, 'Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    sendSuccess(res, 200, null, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res, next) => {
  try {
    // In a real app, you might want to blacklist the token
    sendSuccess(res, 200, null, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};
