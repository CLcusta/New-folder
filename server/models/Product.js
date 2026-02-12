const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select a category'],
  },
  images: [{
    url: {
      type: String,
      required: true,
    },
    publicId: String,
  }],
  availability: {
    type: String,
    enum: ['available', 'out-of-stock', 'discontinued'],
    default: 'available',
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  isPromoted: {
    type: Boolean,
    default: false,
  },
  promotionExpiry: {
    type: Date,
  },
  analytics: {
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    saves: {
      type: Number,
      default: 0,
    },
  },
  tags: [String],
  specifications: {
    type: Map,
    of: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance and search
productSchema.index({ vendor: 1 });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isPromoted: -1, createdAt: -1 });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Virtual for checking if promotion is active
productSchema.virtual('isPromotionActive').get(function() {
  if (!this.isPromoted) return false;
  if (!this.promotionExpiry) return true;
  return new Date() < this.promotionExpiry;
});

// Ensure virtuals are included in JSON
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
