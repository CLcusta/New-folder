const express = require('express');
const { body } = require('express-validator');
const {
  getProfile,
  updateProfile,
  getVendorById,
  getAllVendors,
  getAnalytics,
} = require('../controllers/vendorController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { uploadSingle, convertToBase64 } = require('../middleware/upload.middleware');
const { handleValidationErrors } = require('../middleware/validation.middleware');

const router = express.Router();

// Validation rules
const vendorProfileValidation = [
  body('businessName').trim().notEmpty().withMessage('Business name is required'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),
  body('contactInfo.phone').trim().notEmpty().withMessage('Phone number is required'),
];

// Public routes
router.get('/', getAllVendors);
router.get('/:id', getVendorById);

// Protected vendor routes
router.use(protect);
router.use(authorize('vendor'));

router.get('/profile/me', getProfile);
router.post(
  '/profile',
  uploadSingle,
  convertToBase64,
  vendorProfileValidation,
  handleValidationErrors,
  updateProfile
);
router.get('/analytics/me', getAnalytics);

module.exports = router;
