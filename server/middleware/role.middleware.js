const Vendor = require('../models/Vendor');

/**
 * Authorize user based on roles
 * @param  {...string} roles - Allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Check if user is a vendor and vendor profile is approved
 */
const isApprovedVendor = async (req, res, next) => {
  try {
    if (req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Only vendors can access this route',
      });
    }

    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor profile not found',
      });
    }

    if (vendor.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Vendor account is ${vendor.status}. Please wait for admin approval.`,
      });
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user owns the resource (for vendor operations)
 */
const isResourceOwner = (resourceType) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${resourceType}`);
      const resource = await Model.findById(req.params.id);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: `${resourceType} not found`,
        });
      }

      // For vendors, check if they own the resource
      if (req.user.role === 'vendor') {
        const vendor = await Vendor.findOne({ user: req.user._id });
        
        if (resource.vendor.toString() !== vendor._id.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this resource',
          });
        }
      }

      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
  isApprovedVendor,
  isResourceOwner,
};
