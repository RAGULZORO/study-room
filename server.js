const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a room
  socket.on('join-room', (roomName, username) => {
    socket.join(roomName);
    console.log(`${username} joined room: ${roomName}`);
    socket.to(roomName).emit('user-connected', username);
  });

  // Handle chat messages
  socket.on('chat-message', (data) => {
    const { roomName, message, user } = data;
    io.to(roomName).emit('chat-message', { message, user });
  });

  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    const { to, signal } = data;
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  // Handle leaving a room
  socket.on('leave-room', (roomName, username) => {
    socket.leave(roomName);
    console.log(`${username} left room: ${roomName}`);
    socket.to(roomName).emit('user-disconnected', username);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});