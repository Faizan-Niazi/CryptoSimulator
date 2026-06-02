const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cryptosimulator', {
      serverSelectionTimeoutMS: 1500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB Connection Failed: ${error.message}`);
    console.warn('⚠️  MongoDB is not running. Switching automatically to transparent local JSON persistent database fallback!');
    global.useFallbackDb = true;
  }
};

module.exports = connectDB;
