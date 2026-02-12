const Vendor = require('../models/Vendor');
const Product = require('../models/Product');
const { uploadImage, deleteImage } = require('../config/fileStorage');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get vendor profile
 * @route   GET /api/vendors/profile
 * @access  Private/Vendor
 */
exports.getProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id }).populate('user', 'name email phone');

    if (!vendor) {
      return sendError(res, 404, 'Vendor profile not found');
    }

    sendSuccess(res, 200, { vendor }, 'Vendor profile retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create/Update vendor profile
 * @route   POST /api/vendors/profile
 * @access  Private/Vendor
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { businessName, description, location, contactInfo } = req.body;

    let vendor = await Vendor.findOne({ user: req.user._id });

    const updateData = {
      businessName,
      description,
      location,
      contactInfo,
    };

    // Handle logo upload
    if (req.file) {
      // Delete old logo if exists
      if (vendor && vendor.logo && vendor.logo.filename) {
        await deleteImage(vendor.logo.filename, 'vendors/logos');
      }

      const result = await uploadImage(req.file.buffer, req.file.originalname, 'vendors/logos');
      updateData.logo = {
        url: result.url,
        filename: result.filename,
      };
    }

    if (vendor) {
      // Update existing vendor
      vendor = await Vendor.findByIdAndUpdate(vendor._id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      // Create new vendor profile
      vendor = await Vendor.create({
        user: req.user._id,
        ...updateData,
      });
    }

    sendSuccess(res, 200, { vendor }, 'Vendor profile updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor by ID (public view)
 * @route   GET /api/vendors/:id
 * @access  Public
 */
exports.getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id)
      .populate('user', 'name email')
      .select('-user.password');

    if (!vendor) {
      return sendError(res, 404, 'Vendor not found');
    }

    // Increment profile views
    vendor.analytics.profileViews += 1;
    await vendor.save();

    // Get vendor's products
    const products = await Product.find({ vendor: vendor._id, isActive: true })
      .populate('category', 'name')
      .limit(10)
      .sort('-createdAt');

    sendSuccess(res, 200, { vendor, products }, 'Vendor details retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vendors (with filters)
 * @route   GET /api/vendors
 * @access  Public
 */
exports.getAllVendors = async (req, res, next) => {
  try {
    const { city, status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (status) {
      query.status = status;
    } else {
      // Default to approved vendors for public view
      query.status = 'approved';
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const vendors = await Vendor.find(query)
      .populate('user', 'name email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Vendor.countDocuments(query);

    sendSuccess(res, 200, { vendors, pagination: { page: parseInt(page), limit: parseInt(limit), total } }, 'Vendors retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor analytics
 * @route   GET /api/vendors/analytics
 * @access  Private/Vendor
 */
exports.getAnalytics = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return sendError(res, 404, 'Vendor profile not found');
    }

    // Get product analytics
    const products = await Product.find({ vendor: vendor._id });

    const analytics = {
      vendor: {
        profileViews: vendor.analytics.profileViews,
        totalClicks: vendor.analytics.totalClicks,
        totalProducts: vendor.totalProducts,
        totalSales: vendor.totalSales,
        rating: vendor.rating,
      },
      products: {
        total: products.length,
        active: products.filter(p => p.isActive && p.availability === 'available').length,
        promoted: products.filter(p => p.isPromoted).length,
        totalViews: products.reduce((sum, p) => sum + p.analytics.views, 0),
        totalClicks: products.reduce((sum, p) => sum + p.analytics.clicks, 0),
        totalSaves: products.reduce((sum, p) => sum + p.analytics.saves, 0),
      },
    };

    sendSuccess(res, 200, { analytics }, 'Analytics retrieved');
  } catch (error) {
    next(error);
  }
};
