const { Server } = require('socket.io');
const { purgeExpiredLocks } = require('../services/seatLockService');

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    // Client joins a specific show's real-time room
    socket.on('show:join', (showId) => {
      if (showId) {
        const room = `show:${showId}`;
        socket.join(room);
        socket.data.currentShowId = showId;
      }
    });

    // Client leaves a show's room
    socket.on('show:leave', (showId) => {
      if (showId) {
        socket.leave(`show:${showId}`);
      }
    });

    socket.on('disconnect', () => {
      // Client disconnected
    });
  });

  // Background interval: auto-clean expired locks and broadcast release
  setInterval(async () => {
    try {
      const expired = await purgeExpiredLocks();
      if (expired && expired.length > 0) {
        for (const item of expired) {
          emitSeatReleased(item.showId.toString(), item.seatNumber);
        }
      }
    } catch (err) {
      console.error('[Socket Janitor] Error purging expired locks:', err.message);
    }
  }, 10000); // Check every 10 seconds

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

const emitSeatLocked = (showId, seatData) => {
  if (io) {
    io.to(`show:${showId}`).emit('seat:locked', seatData);
  }
};

const emitSeatReleased = (showId, seatNumber) => {
  if (io) {
    io.to(`show:${showId}`).emit('seat:released', { showId, seatNumber });
  }
};

const emitSeatBooked = (showId, seats) => {
  if (io) {
    io.to(`show:${showId}`).emit('seat:booked', { showId, seats });
  }
};

const emitSeatMapUpdate = (showId, seatMap) => {
  if (io) {
    io.to(`show:${showId}`).emit('show:seatmap:update', { showId, seatMap });
  }
};

module.exports = {
  initSocket,
  getIO,
  emitSeatLocked,
  emitSeatReleased,
  emitSeatBooked,
  emitSeatMapUpdate,
};
