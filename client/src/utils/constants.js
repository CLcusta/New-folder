// API Configuration
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  ADMIN: 'admin',
};

// Product Availability Status
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  OUT_OF_STOCK: 'out-of-stock',
  DISCONTINUED: 'discontinued',
};

// Vendor Status
export const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  BLOCKED: 'blocked',
};

// Promotion Types
export const PROMOTION_TYPES = {
  FEATURED: 'featured',
  BOOSTED: 'boosted',
  PREMIUM: 'premium',
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  PRODUCTS_PER_PAGE: 12,
  VENDORS_PER_PAGE: 10,
};

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGES_PER_PRODUCT: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
};

// Categories (can be fetched from API in production)
export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Food & Beverages',
  'Services',
  'Home & Garden',
  'Sports & Outdoors',
  'Books & Media',
  'Health & Beauty',
  'Automotive',
  'Other',
];
