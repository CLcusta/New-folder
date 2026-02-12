const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const { uploadImage, deleteImage } = require('../config/fileStorage');
const { sendSuccess, sendError, sendPaginatedResponse } = require('../utils/responseHandler');

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private/Vendor
 */
exports.createProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return sendError(res, 404, 'Vendor profile not found');
    }

    if (vendor.status !== 'approved') {
      return sendError(res, 403, 'Vendor must be approved to create products');
    }

    const { name, description, price, category, stock, tags, specifications } = req.body;

    // Handle multiple image uploads
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadImage(file.buffer, file.originalname, 'products');
        images.push({
          url: result.url,
          filename: result.filename,
        });
      }
    }

    const product = await Product.create({
      vendor: vendor._id,
      name,
      description,
      price,
      category,
      images,
      stock,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      specifications: specifications ? JSON.parse(specifications) : {},
    });

    // Update vendor's product count
    vendor.totalProducts += 1;
    await vendor.save();

    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('vendor', 'businessName');

    sendSuccess(res, 201, { product: populatedProduct }, 'Product created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products (with filters and search)
 * @route   GET /api/products
 * @access  Public
 */
exports.getAllProducts = async (req, res, next) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      city,
      search,
      availability,
      promoted,
      page = 1,
      limit = 12,
      sort = '-createdAt',
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (availability) {
      query.availability = availability;
    }

    if (promoted === 'true') {
      query.isPromoted = true;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // If filtering by city, need to join with vendors
    let products;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (city) {
      products = await Product.aggregate([
        { $match: query },
        {
          $lookup: {
            from: 'vendors',
            localField: 'vendor',
            foreignField: '_id',
            as: 'vendorInfo',
          },
        },
        { $unwind: '$vendorInfo' },
        {
          $match: {
            'vendorInfo.location.city': new RegExp(city, 'i'),
          },
        },
        { $skip: skip },
        { $limit: parseInt(limit) },
      ]);

      // Populate after aggregation
      await Product.populate(products, [
        { path: 'category', select: 'name' },
        { path: 'vendor', select: 'businessName location contactInfo' },
      ]);
    } else {
      products = await Product.find(query)
        .populate('category', 'name')
        .populate('vendor', 'businessName location contactInfo')
        .limit(parseInt(limit))
        .skip(skip)
        .sort(sort);
    }

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
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('vendor', 'businessName location contactInfo rating');

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Increment view count
    product.analytics.views += 1;
    await product.save();

    sendSuccess(res, 200, { product }, 'Product retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update product
 * @route   PUT /api/products/:id
 * @access  Private/Vendor
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    let product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check ownership
    if (product.vendor.toString() !== vendor._id.toString()) {
      return sendError(res, 403, 'Not authorized to update this product');
    }

    const { name, description, price, category, stock, availability, tags, specifications } = req.body;

    const updateData = {
      name,
      description,
      price,
      category,
      stock,
      availability,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : product.tags,
      specifications: specifications ? JSON.parse(specifications) : product.specifications,
    };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      // Delete old images
      for (const img of product.images) {
        if (img.publicId) {
          await deleteImage(img.publicId);
        }
      }

      // Upload new images
      const images = [];
      for (const file of req.files) {
        const result = await uploadImage(file.base64, 'products');
        images.push({
          url: result.url,
          publicId: result.publicId,
        });
      }
      updateData.images = images;
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name')
      .populate('vendor', 'businessName');

    sendSuccess(res, 200, { product }, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete product
 * @route   DELETE /api/products/:id
 * @access  Private/Vendor
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    // Check ownership
    if (product.vendor.toString() !== vendor._id.toString()) {
      return sendError(res, 403, 'Not authorized to delete this product');
    }

    // Delete product images from Cloudinary
    for (const img of product.images) {
      if (img.publicId) {
        await deleteImage(img.publicId);
      }
    }

    await product.deleteOne();

    // Update vendor's product count
    vendor.totalProducts = Math.max(0, vendor.totalProducts - 1);
    await vendor.save();

    sendSuccess(res, 200, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get vendor's products
 * @route   GET /api/products/vendor/my-products
 * @access  Private/Vendor
 */
exports.getMyProducts = async (req, res, next) => {
  try {
    const vendor = await Vendor.findOne({ user: req.user._id });

    if (!vendor) {
      return sendError(res, 404, 'Vendor profile not found');
    }

    const { page = 1, limit = 10 } = req.query;

    const products = await Product.find({ vendor: vendor._id })
      .populate('category', 'name')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort('-createdAt');

    const total = await Product.countDocuments({ vendor: vendor._id });

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
 * @desc    Increment product click count
 * @route   POST /api/products/:id/click
 * @access  Public
 */
exports.trackClick = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    product.analytics.clicks += 1;
    await product.save();

    // Also increment vendor's total clicks
    await Vendor.findByIdAndUpdate(product.vendor, {
      $inc: { 'analytics.totalClicks': 1 },
    });

    sendSuccess(res, 200, null, 'Click tracked');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle save product
 * @route   POST /api/products/:id/save
 * @access  Private
 */
exports.toggleSaveProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return sendError(res, 404, 'Product not found');
    }

    const user = req.user;
    const isSaved = user.savedProducts.includes(product._id);

    if (isSaved) {
      // Remove from saved
      user.savedProducts = user.savedProducts.filter(
        id => id.toString() !== product._id.toString()
      );
      product.analytics.saves = Math.max(0, product.analytics.saves - 1);
    } else {
      // Add to saved
      user.savedProducts.push(product._id);
      product.analytics.saves += 1;
    }

    await user.save();
    await product.save();

    sendSuccess(res, 200, { isSaved: !isSaved }, isSaved ? 'Product unsaved' : 'Product saved');
  } catch (error) {
    next(error);
  }
};
