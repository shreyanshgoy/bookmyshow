require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./src/config/db');
const Show = require('./src/models/Show');
const seatLockService = require('./src/services/seatLockService');

async function testSeatConcurrency() {
  console.log('\n--- 🧪 STARTING CONCURRENCY RACE CONDITION TEST ---');
  await connectDB();

  // Find any active show
  const show = await Show.findOne({ isActive: true });
  if (!show) {
    console.error('No shows found to test with. Run npm run seed first.');
    await disconnectDB();
    process.exit(1);
  }

  const showId = show._id.toString();
  const testSeat = 'H12';
  const tier = 'Silver';
  const price = 180;

  const userA_id = new mongoose.Types.ObjectId();
  const userB_id = new mongoose.Types.ObjectId();

  console.log(`[Test] Targeting Show: ${showId}, Seat: ${testSeat}`);
  console.log(`[Test] User A (${userA_id}) and User B (${userB_id}) requesting lock concurrently...`);

  // Release any existing lock on this seat first
  await seatLockService.releaseSeat(showId, testSeat, userA_id);
  await seatLockService.releaseSeat(showId, testSeat, userB_id);

  // Dispatch both requests simultaneously
  const results = await Promise.allSettled([
    seatLockService.lockSeat(showId, testSeat, tier, price, userA_id),
    seatLockService.lockSeat(showId, testSeat, tier, price, userB_id),
  ]);

  let successCount = 0;
  let failureCount = 0;
  let winner = null;

  results.forEach((res, idx) => {
    const userLabel = idx === 0 ? 'User A' : 'User B';
    if (res.status === 'fulfilled') {
      successCount++;
      winner = userLabel;
      console.log(`✅ ${userLabel} SUCCEEDED: Seat locked until ${res.value.expiresAt}`);
    } else {
      failureCount++;
      console.log(`🛡️ ${userLabel} BLOCKED SAFELY: ${res.reason.message} (Status: ${res.reason.statusCode || 409})`);
    }
  });

  console.log('\n--- 📊 TEST RESULTS ---');
  console.log(`Total Concurrent Requests: 2`);
  console.log(`Successful Locks: ${successCount}`);
  console.log(`Blocked / Conflicts: ${failureCount}`);

  if (successCount === 1 && failureCount === 1) {
    console.log('🎉 PASS: Concurrency is safe! Zero double-booking vulnerability detected.\n');
  } else {
    console.error('❌ FAIL: Concurrency anomaly detected!\n');
  }

  // Cleanup test lock
  if (winner === 'User A') {
    await seatLockService.releaseSeat(showId, testSeat, userA_id);
  } else {
    await seatLockService.releaseSeat(showId, testSeat, userB_id);
  }
  console.log('[Test] Cleaned up test seat lock.');

  await disconnectDB();
  process.exit(0);
}

testSeatConcurrency().catch((err) => {
  console.error('Test crashed:', err);
  process.exit(1);
});
