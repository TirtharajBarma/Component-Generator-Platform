import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createClient } from 'redis';

dotenv.config();

export const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  // Add TLS configuration for Upstash (only applied when using HTTPS URLs)
  socket: {
    tls: process.env.REDIS_URL?.startsWith('rediss://') ? true : false,
    rejectUnauthorized: false
  }
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

export const connectDB = async () => {
  try {
    // Check if already connected to avoid multiple connections in serverless
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB connected');
    }
    
    // Check if Redis is already connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('Redis connected');
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
    // Don't exit in serverless environment
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
}; 