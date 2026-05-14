const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Attach user to socket if token is valid — but allow connection either way
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
          attributes: { exclude: ['password'] },
        });
        if (user && user.isActive) socket.user = user;
      }
    } catch {
      // Invalid token — connect as anonymous
    }
    next();
  });

  io.on('connection', (socket) => {
    const userName = socket.user?.name || 'Guest';
    console.log(`Socket connected: ${socket.id} (${userName})`);

    socket.on('join-room', ({ roomId }) => {
      if (!roomId) return;

      // Collect existing participant socket IDs before joining
      const existing = [];
      const room = io.sockets.adapter.rooms.get(roomId);
      if (room) room.forEach((id) => { if (id !== socket.id) existing.push(id); });

      socket.join(roomId);

      // Tell the new joiner who's already there (send array directly)
      socket.emit('room-participants', existing);

      // Tell everyone else this person joined
      socket.to(roomId).emit('user-joined', {
        socketId: socket.id,
        user: socket.user
          ? { id: socket.user.id, name: socket.user.name, avatar: socket.user.avatar || null }
          : { name: 'Guest' },
      });
    });

    socket.on('offer', ({ offer, to }) => {
      io.to(to).emit('offer', { offer, from: socket.id });
    });

    socket.on('answer', ({ answer, to }) => {
      io.to(to).emit('answer', { answer, from: socket.id });
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
      io.to(to).emit('ice-candidate', { candidate, from: socket.id });
    });

    socket.on('chat-message', ({ roomId, message }) => {
      if (!roomId || !message) return;
      io.to(roomId).emit('chat-message', {
        id: Date.now(),
        message,
        sender: socket.user
          ? { id: socket.user.id, name: socket.user.name, avatar: socket.user.avatar || null }
          : { name: 'Guest' },
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('raise-hand', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('hand-raised', {
        socketId: socket.id,
        user: socket.user ? { name: socket.user.name } : { name: 'Guest' },
      });
    });

    socket.on('lower-hand', ({ roomId }) => {
      if (!roomId) return;
      socket.to(roomId).emit('hand-lowered', { socketId: socket.id });
    });

    socket.on('leave-room', ({ roomId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { socketId: socket.id });
    });

    socket.on('go-live', ({ roomId }) => {
      if (!roomId) return;
      io.to(roomId).emit('session-started');
    });

    socket.on('end-session', ({ roomId }) => {
      if (!roomId) return;
      io.to(roomId).emit('session-ended');
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      socket.rooms.forEach((roomId) => {
        if (roomId !== socket.id) {
          socket.to(roomId).emit('user-left', { socketId: socket.id });
        }
      });
    });
  });

  return io;
}

module.exports = setupSocket;
