require('dotenv').config();
const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

const run = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed CLI] Seeding completed successfully.');
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed CLI] Seeding failed:', err);
    process.exit(1);
  }
};

run();
