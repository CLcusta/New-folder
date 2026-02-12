const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const testLogin = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to ${mongoURI}`);

    const email = 'admin@tradecentre.com';
    const password = 'password123';

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const isMatch = await user.comparePassword(password);
    
    if (isMatch) {
      console.log('✅ Login SUCCESS! Password matches.');
      console.log(`User ID: ${user._id}`);
      console.log(`Role: ${user.role}`);
    } else {
      console.log('❌ Login FAILED! Password does NOT match.');
      console.log(`Stored Hash: ${user.password}`);
    }
    
    process.exit();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testLogin();