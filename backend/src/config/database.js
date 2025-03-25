const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const options = {};

    // If credentials are provided in environment variables, use them
    if (process.env.MONGODB_USER && process.env.MONGODB_PASSWORD) {
      options.auth = {
        username: process.env.MONGODB_USER,
        password: process.env.MONGODB_PASSWORD,
      };
    }

    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, options);

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
