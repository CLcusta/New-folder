const mongoose = require('mongoose');
const Category = require('../models/Category');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const seedCategories = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to Database');

    const categories = [
      {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Gadgets, phones, laptops and more',
        icon: '💻'
      },
      {
        name: 'Fashion',
        slug: 'fashion',
        description: 'Clothing, shoes, and accessories',
        icon: '👗'
      },
      {
        name: 'Home & Living',
        slug: 'home-living',
        description: 'Furniture, decor, and home essentials',
        icon: '🏠'
      },
      {
        name: 'Beauty & Health',
        slug: 'beauty-health',
        description: 'Cosmetics, skincare, and wellness',
        icon: '💄'
      },
      {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Equipment, gear, and activewear',
        icon: '⚽'
      },
      {
        name: 'Automotive',
        slug: 'automotive',
        description: 'Car parts, accessories, and tools',
        icon: '🚗'
      }
    ];

    // Clear existing categories
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // Create new categories
    await Category.insertMany(categories);
    console.log('✨ Added default categories:');
    categories.forEach(c => console.log(`   - ${c.name}`));

    console.log('\n✅ Database Seeding Completed!');
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedCategories();