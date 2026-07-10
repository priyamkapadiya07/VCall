const { joinRoom, leaveRoom } = require('../utils/room');

const initializeSocket = (io) => {
  // Map to track which room a socket is currently in
  const socketRoomMap = new Map();

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('join-room', (roomId) => {
      // If user is already in a room, they should leave it first
      const currentRoom = socketRoomMap.get(socket.id);
      if (currentRoom) {
        leaveRoom(currentRoom, socket.id);
        socket.leave(currentRoom);
      }

      const result = joinRoom(roomId, socket.id);
      
      if (result.error) {
        socket.emit('room-full');
        return;
      }

      socket.join(roomId);
      socketRoomMap.set(socket.id, roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);

      // Notify others in the room
      socket.to(roomId).emit('user-connected', socket.id);
    });

    // WebRTC Signaling Events
    socket.on('offer', (data) => {
      // Forward the offer to the specific user
      socket.to(data.to).emit('offer', {
        from: socket.id,
        offer: data.offer
      });
    });

    socket.on('answer', (data) => {
      // Forward the answer to the specific user
      socket.to(data.to).emit('answer', {
        from: socket.id,
        answer: data.answer
      });
    });

    socket.on('ice-candidate', (data) => {
      // Forward the ICE candidate to the specific user
      socket.to(data.to).emit('ice-candidate', {
        from: socket.id,
        candidate: data.candidate
      });
    });

    socket.on('toggle-mute', (data) => {
      console.log(`Server: relaying toggle-mute from ${socket.id} to ${data.to}: ${data.isMuted}`);
      // Forward the mute status to the specific user
      socket.to(data.to).emit('toggle-mute', {
        from: socket.id,
        isMuted: data.isMuted
      });
    });

    socket.on('toggle-video', (data) => {
      console.log(`Server: relaying toggle-video from ${socket.id} to ${data.to}: ${data.isVideoOff}`);
      socket.to(data.to).emit('toggle-video', {
        from: socket.id,
        isVideoOff: data.isVideoOff
      });
    });

    const handleDisconnect = () => {
      const roomId = socketRoomMap.get(socket.id);
      if (roomId) {
        leaveRoom(roomId, socket.id);
        socketRoomMap.delete(socket.id);
        socket.to(roomId).emit('user-disconnected', socket.id);
        console.log(`User ${socket.id} left room ${roomId}`);
      }
    };

    socket.on('leave-room', () => {
      handleDisconnect();
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      handleDisconnect();
    });
  });
};

module.exports = initializeSocket;
