const express = require('express');
const { body } = require('express-validator');
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadSingle, convertToBase64 } = require('../middleware/upload.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
];

// Public routes
router.get('/', getAllCategories);
router.get('/:identifier', getCategoryById);

// Admin-only routes
router.use(protect);
router.use(authorize('admin'));

router.post(
  '/',
  uploadSingle,
  convertToBase64,
  categoryValidation,
  handleValidationErrors,
  createCategory
);

router.put(
  '/:id',
  uploadSingle,
  convertToBase64,
  categoryValidation,
  handleValidationErrors,
  updateCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;
