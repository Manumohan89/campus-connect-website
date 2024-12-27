const express = require('express');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const config = require('./config');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
app.use(express.json());
app.use(cors());
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
const fs = require('fs');
require('dotenv').config();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  });
  
  app.use('/api/', limiter);
// API routes
app.use('/api/users', userRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));
app.use(helmet());
// Catch all route to serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});
io.on('connection', (socket) => {
    console.log('User connected');
    
    // Example notification
    socket.emit('notification', { message: 'Welcome to Campus Connect!' });
  });
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
  }
// Start the server
app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
});
