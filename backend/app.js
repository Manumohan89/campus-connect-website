require('dotenv').config();

const express    = require('express');
const fs         = require('fs');
const path       = require('path');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

// Routes
const userRoutes        = require('./routes/userRoutes');
const authRoutes        = require('./routes/authRoutes');
const trainingRoutes    = require('./routes/trainingRoutes');
const resourceRoutes    = require('./routes/resourceRoutes');
const featuresRoutes    = require('./routes/featuresRoutes');
const adminRoutes       = require('./routes/adminRoutes');
const codingRoutes      = require('./routes/codingRoutes');
const forumRoutes       = require('./routes/forumRoutes');
const paymentRoutes     = require('./routes/paymentRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const flashcardRoutes   = require('./routes/flashcardRoutes');
const newsRoutes        = require('./routes/newsRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const scholarshipRoutes  = require('./routes/scholarshipRoutes');
const internshipRoutes   = require('./routes/internshipRoutes');
const projectRoutes      = require('./routes/projectRoutes');
const config            = require('./config');

const app = express();

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));
app.set('trust proxy', 1);

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    // Allow all configured origins + Vercel preview URLs
    const allowed = config.allowedOrigins || [];
    const isAllowed = allowed.includes(origin) ||
      allowed.includes('*') ||
      /\.vercel\.app$/.test(origin) ||
      /localhost:\d+/.test(origin);
    if (isAllowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({ windowMs: 15*60*1000, max: 300, standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests. Try again in 15 minutes.' }, skip: req => req.path === '/health' });
app.use('/api/', apiLimiter);

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 15,
  message: { error: 'Too many auth attempts. Try again in 15 minutes.' } });
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users/forgot-password', authLimiter);

// ── Dev request logger ────────────────────────────────────────────────────────
if (config.nodeEnv !== 'production') {
  app.use((req, _res, next) => {
    // lightweight — only logs slow or errored in prod
    next();
  });
}

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/users',        userRoutes);
app.use('/api/auth',         authRoutes);
app.use('/api/training',     trainingRoutes);
app.use('/api/resources',    resourceRoutes);
app.use('/api/features',     featuresRoutes);
app.use('/api/admin',        adminRoutes);
app.use('/api/coding',       codingRoutes);
app.use('/api/forum',        forumRoutes);
app.use('/api/payments',     paymentRoutes);
app.use('/api/leaderboard',  leaderboardRoutes);
app.use('/api/flashcards',   flashcardRoutes);
app.use('/api/news',         newsRoutes);
app.use('/api/ai',           aiRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/internship-programs', internshipRoutes);
app.use('/api/projects',     projectRoutes);
const earnRoutes             = require('./routes/earnRoutes');
app.use('/api/earn',          earnRoutes);
const workshopFeedbackRoutes = require('./routes/workshopFeedbackRoutes');
app.use('/api/workshop-feedback', workshopFeedbackRoutes); // public — no auth needed

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok', timestamp: new Date().toISOString(), env: config.nodeEnv, uptime: Math.floor(process.uptime()), db: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: e.message });
  }
});

// ── Serve uploaded files ──────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Serve React build ─────────────────────────────────────────────────────────
const buildPath = path.join(__dirname, '../frontend/build');
if (fs.existsSync(buildPath)) {
  app.use(express.static(buildPath));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) res.sendFile(path.join(buildPath, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.json({ message: 'Campus Connect API running. Build frontend to serve UI.' }));
}

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Unhandled error on', req.path, ':', err.message);
  if (config.nodeEnv !== 'production') console.error(err.stack);
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request body too large' });
  if (err.name === 'MulterError') return res.status(400).json({ error: `Upload error: ${err.message}` });
  res.status(500).json({ error: 'Internal server error. Our team has been notified.' });
});

// ── Ensure upload dirs ────────────────────────────────────────────────────────
['uploads','uploads/profile-photos','uploads/resources'].forEach(dir => {
  const fp = path.join(__dirname, dir);
  if (!fs.existsSync(fp)) fs.mkdirSync(fp, { recursive: true });
});

// ── Auto-migrations ───────────────────────────────────────────────────────────
const runMigrations = async () => {
  const pool = require('./db');
  for (const file of ['init.sql','run_migration.sql','migration_v2.sql','migration_v3.sql','earn_migration.sql','admin_migration.sql','workshop_feedback_migration.sql','remove_otp_migration.sql','fix_constraints_migration.sql','enrollments_constraint_migration.sql','user_solved_problems_constraint_migration.sql']) {
    const fp = path.join(__dirname, 'database', file);
    if (!fs.existsSync(fp)) continue;
    try {
      await pool.query(fs.readFileSync(fp, 'utf8'));
      console.log(`✅ Migration: ${file}`);
    } catch (e) {
      if (!e.message.includes('already exists') && !e.message.includes('duplicate'))
        console.error(`⚠️  ${file}: ${e.message.substring(0,120)}`);
    }
  }
};

// ── Seed default data ─────────────────────────────────────────────────────────
const autoSeed = async () => {
  try {
    const pool = require('./db');
    const [codingCount, newsCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM coding_problems'),
      pool.query('SELECT COUNT(*) FROM vtu_news'),
    ]);
    const { execFile } = require('child_process');
    if (parseInt(codingCount.rows[0].count) === 0) {
      execFile('node', [path.join(__dirname, 'database/seed_coding.js')], (err,out) => {
        if (err) console.error('Coding seed error:', err.message); else console.log(out.trim());
      });
    }
    if (parseInt(newsCount.rows[0].count) === 0) {
      // Seed news directly without HTTP call
      // Use already-required newsRoutes (avoid re-require)
      if (newsRoutes.seedNews) newsRoutes.seedNews().catch(() => {});
    }
  } catch (_) {}
};

// ── Socket.io Real-time Study Rooms ──────────────────────────────────────────────
const http = require('http');
const { Server: SocketIO } = require('socket.io');
const server = http.createServer(app);
let io;
try {
  io = new SocketIO(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const allowed = config.allowedOrigins || [];
        const ok = allowed.includes(origin) ||
                   allowed.includes('*') ||
                   /\.vercel\.app$/.test(origin) ||
                   /localhost:\d+/.test(origin);
        callback(ok ? null : new Error('Socket CORS blocked'), ok);
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const pool = require('./db');
  const ROOM_HISTORY_LIMIT = 50;

  io.on('connection', (socket) => {
    let currentRoom = null;
    let currentUser = null;

    socket.on('join_room', async ({ room, username, userId }) => {
      if (currentRoom) socket.leave(currentRoom);
      currentRoom = room;
      currentUser = { username, userId };
      socket.join(room);

      // Send room history
      try {
        const history = await pool.query(
          'SELECT * FROM chat_messages WHERE room_key=$1 ORDER BY created_at DESC LIMIT $2',
          [room, ROOM_HISTORY_LIMIT]
        );
        socket.emit('room_history', history.rows.reverse());
      } catch {}

      // Online count
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0;
      io.to(room).emit('online_count', roomSize);
      socket.to(room).emit('user_joined', { username, room });
    });

    socket.on('send_message', async ({ room, message, username, userId }) => {
      if (!message?.trim() || message.length > 1000) return;
      const msg = {
        room_key: room, user_id: userId, username,
        body: message.trim(), created_at: new Date().toISOString()
      };
      try {
        const saved = await pool.query(
          'INSERT INTO chat_messages (room_key, user_id, username, body) VALUES ($1,$2,$3,$4) RETURNING *',
          [room, userId, username, message.trim()]
        );
        io.to(room).emit('new_message', saved.rows[0]);
        // Cleanup old messages (keep last 200)
        pool.query('DELETE FROM chat_messages WHERE room_key=$1 AND id NOT IN (SELECT id FROM chat_messages WHERE room_key=$1 ORDER BY created_at DESC LIMIT 200)', [room]).catch(() => {});
      } catch {
        io.to(room).emit('new_message', { ...msg, id: Date.now() });
      }
    });

    socket.on('typing', ({ room, username }) => {
      socket.to(room).emit('user_typing', { username });
    });

    socket.on('stop_typing', ({ room }) => {
      socket.to(room).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      if (currentRoom) {
        const roomSize = (io.sockets.adapter.rooms.get(currentRoom)?.size || 0);
        io.to(currentRoom).emit('online_count', roomSize);
        if (currentUser) socket.to(currentRoom).emit('user_left', currentUser);
      }
    });
  });
  console.log('✅ Socket.io study rooms initialized');
} catch (e) {
  console.warn('⚠️  Socket.io not available (socket.io package may not be installed):', e.message);
}

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = config.port;
(server || app).listen(PORT, async () => {
  console.log(`🚀 Campus Connect on port ${PORT} [${config.nodeEnv}]`);
  await runMigrations().catch(e => console.error('Migration failed:', e.message));
  setTimeout(autoSeed, 4000);
});

// ── Process error handlers ────────────────────────────────────────────────────
process.on('SIGTERM', () => { console.log('SIGTERM — shutting down'); process.exit(0); });
process.on('uncaughtException', err => { console.error('Uncaught:', err.message); if (config.nodeEnv==='production') process.exit(1); });
process.on('unhandledRejection', reason => { console.error('Unhandled rejection:', reason); });

module.exports = app;
