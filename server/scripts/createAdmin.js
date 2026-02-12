const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '../.env' });

const createAdmin = async () => {
  try {
    // Use the URI from .env or fallback to the one in .env file
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected to ${mongoURI}`);

    const adminExists = await User.findOne({ email: 'admin@tradecentre.com' });

    if (adminExists) {
      console.log('Admin user exists. Updating password...');
      adminExists.password = 'password123';
      await adminExists.save();
      console.log('Admin password updated to: password123');
      process.exit();
    }

    const user = await User.create({
      name: 'Super Admin',
      email: 'admin@tradecentre.com',
      password: 'password123', // Send plain text, model handles hashing
      role: 'admin',
      isActive: true,
    });

    console.log('Admin user created successfully');
    console.log('Email: admin@tradecentre.com');
    console.log('Password: password123');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
