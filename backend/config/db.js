const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/enterprise_hr';
    const options = {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000
    };
    await mongoose.connect(mongoURI, options);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    if (error.message.includes('querySrv ECONNREFUSED')) {
      console.error('\n--- DNS/Network issue detected ---');
      console.error('Try using STANDARD connection string instead of mongodb+srv://');
      console.error('In Atlas: Database -> Connect -> Drivers -> see "Connection string only" for both formats');
      console.error('Use: mongodb://user:pass@host1:27017,host2:27017/dbname?ssl=true&authSource=admin');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
