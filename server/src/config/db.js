const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bookmyshow';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${uri}`);
    // Attempt connecting to the configured URI with a short server selection timeout
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Successfully connected to MongoDB: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[Database] Primary MongoDB connection failed (${err.message}).`);
    console.log(`[Database] Falling back to embedded MongoMemoryServer for seamless zero-setup execution...`);

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongod = await MongoMemoryServer.create();
      const memoryUri = mongod.getUri();
      await mongoose.connect(memoryUri);
      console.log(`[Database] Connected to in-memory MongoDB at: ${memoryUri}`);

      // Auto-seed in-memory DB so the user immediately has full movies, theaters, and shows!
      const { seedDatabase } = require('../utils/seedData');
      await seedDatabase();
      console.log(`[Database] Auto-seeded in-memory database with sample movies, theaters, screens, and shows!`);
    } catch (memErr) {
      console.error(`[Database] Failed to initialize MongoMemoryServer:`, memErr);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = { connectDB, disconnectDB };
