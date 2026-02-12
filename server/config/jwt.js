const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {string} role - User role (admin, vendor, customer)
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

module.exports = {
  generateToken,
  verifyToken,
  JWT_SECRET,
};
