// In-memory room storage
// Map<roomId, Set<socketId>>
const rooms = new Map();

const joinRoom = (roomId, socketId) => {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  
  const room = rooms.get(roomId);
  
  if (room.size >= 2) {
    return { error: 'Room is full' };
  }
  
  room.add(socketId);
  return { success: true, users: Array.from(room) };
};

const leaveRoom = (roomId, socketId) => {
  if (rooms.has(roomId)) {
    const room = rooms.get(roomId);
    room.delete(socketId);
    
    // Clean up empty rooms
    if (room.size === 0) {
      rooms.delete(roomId);
    }
  }
};

const getRoomUsers = (roomId) => {
  if (rooms.has(roomId)) {
    return Array.from(rooms.get(roomId));
  }
  return [];
};

module.exports = {
  joinRoom,
  leaveRoom,
  getRoomUsers
};
