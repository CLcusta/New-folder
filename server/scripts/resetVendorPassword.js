const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config({ path: '../.env' });

const resetVendorPassword = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to Database`);

    const email = 'tatendautete4@gmail.com';
    const newPassword = 'password123';

    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
    } else {
      user.password = newPassword;
      // Triggers the pre-save hook to hash the password
      await user.save();
      console.log(`\n✅ SUCCESS! Password updated.`);
      console.log(`   Email:    ${email}`);
      console.log(`   Password: ${newPassword}`);
      console.log(`   Role:     ${user.role}`);
    }

    process.exit();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetVendorPassword();
