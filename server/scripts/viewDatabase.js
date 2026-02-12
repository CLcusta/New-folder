const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: '../.env' });

const viewDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vendor-advertising';
    
    // Connect to Database
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`\n✅ Connected to Database: ${mongoURI}\n`);

    // Get all collections
    const collections = await mongoose.connection.db.collections();
    
    console.log('📊 DATABASE SUMMARY (RAW DATA)\n' + '='.repeat(50));

    for (let collection of collections) {
      const name = collection.collectionName;
      const count = await collection.countDocuments();
      
      console.log(`\n📂 COLLECTION: ${name.toUpperCase()} (${count} records)`);
      console.log('-'.repeat(50));
      
      // Fetch data
      const data = await collection.find({}).limit(5).toArray();
      
      if (data.length === 0) {
        console.log('   (No data found)');
      } else {
        console.log(JSON.stringify(data, null, 2));
      }
      
      if (count > 5) {
        console.log(`\n   ... and ${count - 5} more records.`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('End of Database Dump');
    process.exit();

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

viewDatabase();