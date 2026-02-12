const express = require('express');
const {
  getDashboardStats,
  getAllVendors,
  updateVendorStatus,
  getAllProducts,
  deleteProduct,
  toggleProductStatus,
  getAllUsers,
  toggleUserStatus,
  getAllPromotions,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

const router = express.Router();

// All routes are admin-only
router.use(protect);
router.use(authorize('admin'));

// Dashboard
router.get('/stats', getDashboardStats);

// Vendor management
router.get('/vendors', getAllVendors);
router.put('/vendors/:id/status', updateVendorStatus);

// Product management
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/toggle-active', toggleProductStatus);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserStatus);

// Promotion management
router.get('/promotions', getAllPromotions);

module.exports = router;
