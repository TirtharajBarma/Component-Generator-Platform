import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
    await redisClient.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}; 