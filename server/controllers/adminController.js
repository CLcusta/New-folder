const User = require('../models/User');
const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const { sendSuccess, sendError, sendPaginatedResponse } = require('../utils/responseHandler');

/**
 * @desc    Get admin dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        customers: await User.countDocuments({ role: 'customer' }),
        vendors: await User.countDocuments({ role: 'vendor' }),
        admins: await User.countDocuments({ role: 'admin' }),
        active: await User.countDocuments({ isActive: true }),
      },
      vendors: {
        total: await Vendor.countDocuments(),
        approved: await Vendor.countDocuments({ status: 'approved' }),
        pending: await Vendor.countDocuments({ status: 'pending' }),
        blocked: await Vendor.countDocuments({ status: 'blocked' }),
      },
      products: {
        total: await Product.countDocuments(),
        active: await Product.countDocuments({ isActive: true }),
        promoted: await Product.countDocuments({ isPromoted: true }),
        outOfStock: await Product.countDocuments({ availability: 'out-of-stock' }),
      },
      promotions: {
        total: await Promotion.countDocuments(),
        active: await Promotion.countDocuments({ status: 'active' }),
        expired: await Promotion.countDocuments({ status: 'expired' }),
      },
    };

    sendSuccess(res, 200, { stats }, 'Dashboard statistics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vendors (admin view)
 * @route   GET /api/admin/vendors
 * @access  Private/Admin
 */
exports.getAllVendors = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = status ? { status } : {};

    const vendors = await Vendor.find(query)
      .populate('user', 'name email phone isActive')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Vendor.countDocuments(query);

    sendPaginatedResponse(
      res,
      200,
      vendors,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Vendors retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update vendor status (approve/block)
 * @route   PUT /api/admin/vendors/:id/status
 * @access  Private/Admin
 */
exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['approved', 'blocked', 'pending'].includes(status)) {
      return sendError(res, 400, 'Invalid status');
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!vendor) {
      return sendError(res, 404, 'Vendor not found');
    }

    sendSuccess(res, 200, { vendor }, `Vendor ${status} successfully`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products (admin view)
 * @route   GET /api/admin/products
 * @access  Private/Admin
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const { isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const products = await Product.find(query)
      .populate('vendor', 'businessName')
      .populate('category', 'name')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Product.countDocuments(query);

    sendPaginatedResponse(
      res,
      200,
      products,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Products retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product (admin)
 * @route   DELETE /api/admin/products/:id
 * @access  Private/Admin
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    await product.deleteOne();

    // Update vendor's product count
    await Vendor.findByIdAndUpdate(product.vendor, {
      $inc: { totalProducts: -1 },
    });

    sendSuccess(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle product active status
 * @route   PUT /api/admin/products/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleProductStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    product.isActive = !product.isActive;
    await product.save();

    sendSuccess(
      res,
      200,
      { product },
      `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 10 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await User.countDocuments(query);

    sendPaginatedResponse(
      res,
      200,
      users,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Users retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle user active status
 * @route   PUT /api/admin/users/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (user.role === 'admin') {
      return sendError(res, 403, 'Cannot deactivate admin users');
    }

    user.isActive = !user.isActive;
    await user.save();

    sendSuccess(
      res,
      200,
      { user },
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all promotions
 * @route   GET /api/admin/promotions
 * @access  Private/Admin
 */
exports.getAllPromotions = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const query = status ? { status } : {};

    const promotions = await Promotion.find(query)
      .populate('vendor', 'businessName')
      .populate('product', 'name price')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Promotion.countDocuments(query);

    sendPaginatedResponse(
      res,
      200,
      promotions,
      { page: parseInt(page), limit: parseInt(limit), total },
      'Promotions retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};
