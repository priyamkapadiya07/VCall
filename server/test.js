const { io } = require('socket.io-client');
const socket1 = io('http://localhost:5000');
const socket2 = io('http://localhost:5000');

socket1.on('connect', () => {
  console.log('Socket 1 connected');
  socket1.emit('join-room', 'room1');
});

socket2.on('connect', () => {
  console.log('Socket 2 connected');
  socket2.emit('join-room', 'room1');
});

socket1.on('user-connected', (id) => {
  console.log('Socket 1 saw user connected:', id);
  socket1.emit('offer', { to: id, offer: { type: 'offer', sdp: 'dummy' } });
});

socket2.on('offer', (data) => {
  console.log('Socket 2 got offer from:', data.from);
  socket2.emit('answer', { to: data.from, answer: { type: 'answer', sdp: 'dummy' } });
});

socket1.on('answer', (data) => {
  console.log('Socket 1 got answer from:', data.from);
  process.exit(0);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 3000);
