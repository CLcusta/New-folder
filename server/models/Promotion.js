const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
  },
  type: {
    type: String,
    enum: ['featured', 'boosted', 'premium'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending',
  },
  analytics: {
    impressions: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    conversions: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Update status based on dates
promotionSchema.pre('save', function(next) {
  const now = new Date();
  if (this.endDate < now && this.status === 'active') {
    this.status = 'expired';
  }
  next();
});

// Indexes
promotionSchema.index({ product: 1 });
promotionSchema.index({ vendor: 1 });
promotionSchema.index({ status: 1, endDate: -1 });

module.exports = mongoose.model('Promotion', promotionSchema);
