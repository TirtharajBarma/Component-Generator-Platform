#!/usr/bin/env node
import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

async function viewRedisData() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis\n');
    
    // Get all keys
    const keys = await redisClient.keys('*');
    console.log(`Found ${keys.length} keys in Redis:\n`);
    
    for (const key of keys) {
      const type = await redisClient.type(key);
      console.log(`🔑 Key: ${key}`);
      console.log(`📝 Type: ${type}`);
      
      try {
        if (type === 'string') {
          const value = await redisClient.get(key);
          console.log(`💾 Size: ${value.length} characters`);
          
          // Try to parse as JSON for better display
          try {
            const parsed = JSON.parse(value);
            if (key.startsWith('session:')) {
              console.log(`👤 User ID: ${parsed.user}`);
              console.log(`💬 Chat messages: ${parsed.chat?.length || 0}`);
              console.log(`🎨 Has JSX code: ${parsed.code?.jsx ? 'Yes' : 'No'}`);
              console.log(`🎨 Has CSS code: ${parsed.code?.css ? 'Yes' : 'No'}`);
              console.log(`📅 Created: ${new Date(parsed.createdAt).toLocaleString()}`);
              console.log(`📅 Updated: ${new Date(parsed.updatedAt).toLocaleString()}`);
            } else {
              console.log(`📄 Preview: ${JSON.stringify(parsed).substring(0, 100)}...`);
            }
          } catch {
            console.log(`📄 Preview: ${value.substring(0, 100)}...`);
          }
        } else if (type === 'stream') {
          const entries = await redisClient.xRange(key, '-', '+');
          console.log(`📊 Stream entries: ${entries.length}`);
          if (entries.length > 0) {
            console.log(`📄 Latest entry: ${JSON.stringify(entries[entries.length - 1])}`);
          }
        } else {
          console.log(`ℹ️  Complex data type: ${type}`);
        }
      } catch (error) {
        console.log(`❌ Error reading key: ${error.message}`);
      }
      
      console.log('─'.repeat(50));
    }
    
    // Show memory usage
    const info = await redisClient.info('memory');
    const memoryLines = info.split('\n').filter(line => 
      line.includes('used_memory_human') || 
      line.includes('used_memory_dataset_perc')
    );
    console.log('\n📊 Memory Usage:');
    memoryLines.forEach(line => console.log(`   ${line}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await redisClient.quit();
  }
}

viewRedisData();
