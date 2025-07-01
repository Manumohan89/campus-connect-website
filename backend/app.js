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

// === Middlewares ===
app.use(express.json());

// ✅ Enable CORS from your frontend domain
app.use(cors({
  origin: [
    'https://campus-connect-website-1.onrender.com',
    'https://campus-connect.online',
    'https://www.campus-connect.online' // if you're using www version too
  ],
  credentials: true,
}));


app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https:"],
        styleSrc: ["'self'", "https:", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https://randomuser.me"],
        connectSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);


// ✅ Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use('/api/', limiter);

// === API Routes ===
app.use('/api/users', userRoutes);

// ✅ Serve static files (uploads like PDFs)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Serve frontend React build
const frontendPath = path.join(__dirname, '../frontend/build');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// ✅ WebSocket (optional)
io.on('connection', (socket) => {
  console.log('User connected');
  socket.emit('notification', { message: 'Welcome to Campus Connect!' });
});

// ✅ Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// ✅ Start server
server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
