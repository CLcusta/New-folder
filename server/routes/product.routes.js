const express = require('express');
const { body } = require('express-validator');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getMyProducts,
  trackClick,
  toggleSaveProduct,
} = require('../controllers/productController');
const { protect, optionalAuth } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadMultiple, convertToBase64 } = require('../middleware/upload.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required'),
];

// Public routes
router.get('/', optionalAuth, getAllProducts);
router.get('/:id', optionalAuth, getProductById);
router.post('/:id/click', trackClick);

// Protected routes (all users)
router.post('/:id/save', protect, toggleSaveProduct);

// Vendor-only routes
router.use(protect);
router.use(authorize('vendor'));

router.post(
  '/',
  uploadMultiple,
  convertToBase64,
  productValidation,
  handleValidationErrors,
  createProduct
);

router.get('/vendor/my-products', getMyProducts);

router.put(
  '/:id',
  uploadMultiple,
  convertToBase64,
  productValidation,
  handleValidationErrors,
  updateProduct
);

router.delete('/:id', deleteProduct);

module.exports = router;
