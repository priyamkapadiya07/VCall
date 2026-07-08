require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const initializeSocket = require('./socket');

const app = express();
const server = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 5000;
let CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Remove trailing slash if present to prevent CORS origin mismatch
if (CLIENT_URL.endsWith('/')) {
  CLIENT_URL = CLIENT_URL.slice(0, -1);
}

const allowedOrigins = [CLIENT_URL, 'http://localhost:5173'];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

initializeSocket(io);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
