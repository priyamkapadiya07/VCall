require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const initializeSocket = require('./socket');
const webpush = require('web-push');

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

// Web Push Configuration
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BN5Xh3_NVY2vrWf8Px8jlflcZ-uI03IGGKJw1C6SRztjSozxGg4XzEeX_rcXqhI6revltjMlj9K6QAJzX5D95gI';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'cIj6gPpR1p8UsvexB1ZkW513Lxdsw711KP-hAlQu2nE';

webpush.setVapidDetails(
  'mailto:contact@vcall.app',
  publicVapidKey,
  privateVapidKey
);

// Push Notification Endpoint
app.post('/api/push', (req, res) => {
  const { subscription, payload } = req.body;
  
  if (!subscription) {
    return res.status(400).json({ error: 'Subscription object is required' });
  }

  webpush.sendNotification(subscription, JSON.stringify(payload || {}))
    .then(() => res.status(201).json({ success: true }))
    .catch(err => {
      console.error('Push error:', err);
      res.status(500).json({ error: 'Failed to send push notification' });
    });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
