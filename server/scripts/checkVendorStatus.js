const mongoose = require('mongoose');
const Vendor = require('../models/Vendor');
const Category = require('../models/Category');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const checkData = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`\n✅ Connected to Database`);

    // Check Categories
    const categories = await Category.find({});
    console.log(`\n📂 CATEGORIES (${categories.length})`);
    if (categories.length === 0) {
      console.log('❌ NO CATEGORIES FOUND! You must create categories before adding products.');
    } else {
      categories.forEach(c => console.log(` - ${c.name} (${c._id})`));
    }

    // Check Vendors
    const vendors = await Vendor.find({}).populate('user');
    console.log(`\n📂 VENDORS (${vendors.length})`);
    
    if (vendors.length === 0) {
       console.log('❌ NO VENDORS FOUND.');
    } else {
      vendors.forEach(v => {
        console.log(` - ${v.businessName} (Status: ${v.status}) (User: ${v.user ? v.user.email : 'N/A'})`);
        if (v.status !== 'approved') {
          console.log(`   ⚠️ WARNING: This vendor cannot add products because status is NOT 'approved'.`);
        }
      });
    }

    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkData();