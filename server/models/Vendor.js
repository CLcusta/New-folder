const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  businessName: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
    maxlength: [200, 'Business name cannot exceed 200 characters'],
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
  },
  logo: {
    url: String,
    publicId: String,
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide an address'],
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
    },
    state: String,
    country: {
      type: String,
      required: [true, 'Please provide a country'],
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  contactInfo: {
    phone: {
      type: String,
      required: [true, 'Please provide a phone number'],
    },
    whatsapp: String,
    email: String,
    website: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'blocked'],
    default: 'pending',
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  totalProducts: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  analytics: {
    profileViews: {
      type: Number,
      default: 0,
    },
    totalClicks: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Indexes for performance
vendorSchema.index({ user: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ 'location.city': 1 });
vendorSchema.index({ businessName: 'text', description: 'text' });

module.exports = mongoose.model('Vendor', vendorSchema);
