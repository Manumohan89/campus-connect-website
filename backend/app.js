const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const config = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: 'https://campus-connect-website-1.onrender.com', // ✅ frontend domain
  credentials: true
}));
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// WebSocket
io.on('connection', (socket) => {
  console.log('User connected');
  socket.emit('notification', { message: 'Welcome to Campus Connect!' });
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Start the server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
