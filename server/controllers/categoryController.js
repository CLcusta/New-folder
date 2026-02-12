const Category = require('../models/Category');
const Product = require('../models/Product');
const { uploadImage, deleteImage } = require('../config/cloudinary');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
exports.getAllCategories = async (req, res, next) => {
  try {
    const { active } = req.query;

    const query = active === 'true' ? { isActive: true } : {};

    const categories = await Category.find(query)
      .populate('parent', 'name slug')
      .sort('name');

    sendSuccess(res, 200, { categories }, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single category by ID or slug
 * @route   GET /api/categories/:identifier
 * @access  Public
 */
exports.getCategoryById = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    // Try to find by ID first, then by slug
    let category = await Category.findById(identifier).populate('parent', 'name slug');

    if (!category) {
      category = await Category.findOne({ slug: identifier }).populate('parent', 'name slug');
    }

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Get products in this category
    const products = await Product.find({ category: category._id, isActive: true })
      .populate('vendor', 'businessName location')
      .limit(20)
      .sort('-createdAt');

    sendSuccess(res, 200, { category, products }, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, icon, parent } = req.body;

    const categoryData = {
      name,
      description,
      icon,
      parent: parent || null,
    };

    // Handle image upload
    if (req.file) {
      const result = await uploadImage(req.file.base64, 'categories');
      categoryData.image = {
        url: result.url,
        publicId: result.publicId,
      };
    }

    const category = await Category.create(categoryData);

    sendSuccess(res, 201, { category }, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
exports.updateCategory = async (req, res, next) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    const { name, description, icon, parent, isActive } = req.body;

    const updateData = {
      name,
      description,
      icon,
      parent: parent || null,
      isActive,
    };

    // Handle image upload
    if (req.file) {
      // Delete old image
      if (category.image && category.image.publicId) {
        await deleteImage(category.image.publicId);
      }

      const result = await uploadImage(req.file.base64, 'categories');
      updateData.image = {
        url: result.url,
        publicId: result.publicId,
      };
    }

    category = await Category.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    sendSuccess(res, 200, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found');
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ category: category._id });

    if (productCount > 0) {
      return sendError(
        res,
        400,
        `Cannot delete category with ${productCount} products. Please reassign or delete products first.`
      );
    }

    // Delete image from Cloudinary
    if (category.image && category.image.publicId) {
      await deleteImage(category.image.publicId);
    }

    await category.deleteOne();

    sendSuccess(res, 200, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
