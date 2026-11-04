import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsphere';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      // mongoose options can be omitted in recent versions
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
