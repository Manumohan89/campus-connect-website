/**
 * Earn Platform Routes — AI Data Collection + Payments
 * POST /earn/submit        — Submit a task (voice/image/text)
 * GET  /earn/tasks         — Get available tasks
 * GET  /earn/wallet        — Get user wallet
 * POST /earn/withdraw      — Request withdrawal
 * GET  /earn/admin/submissions — Admin: view all submissions
 * POST /earn/admin/approve/:id — Admin: approve a submission
 * GET  /earn/admin/export  — Admin: export dataset as JSON/CSV
 */

const express   = require('express');
const router    = express.Router();
const pool      = require('../db');
const authMiddleware  = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const multer    = require('multer');
const path      = require('path');
const rateLimit = require('express-rate-limit');
const cloudinarySDK = require('cloudinary').v2;

// ── Rate limiting (prevent spam) ──────────────────────────────────────────────
const submitLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,
  message: { error: 'Too many submissions. Please wait a moment.' },
});

// ── Memory-only upload (Render ephemeral disk — never use diskStorage) ─────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = /audio\/(webm|mp4|mpeg|ogg|wav)|image\/(jpeg|png|webp)/;
    if (allowed.test(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type. Only audio and image files allowed.'));
  },
});

// ── Upload buffer to Cloudinary, fallback to base64 data URL ─────────────────
async function uploadEarnFile(buffer, originalname, mimetype) {
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;
  if (cloud_name && api_key && api_secret) {
    cloudinarySDK.config({ cloud_name, api_key, api_secret });
    const resourceType = mimetype.startsWith('audio/') ? 'video' : 'image'; // Cloudinary uses 'video' for audio
    return new Promise((resolve, reject) => {
      cloudinarySDK.uploader.upload_stream(
        { folder: 'campus-connect/earn', resource_type: resourceType },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      ).end(buffer);
    });
  }
  // Fallback: base64 data URL (no external service needed)
  return `data:${mimetype};base64,${buffer.toString('base64')}`;
}

// ── Task reward amounts ────────────────────────────────────────────────────────
const REWARDS = { voice: 5.00, image: 3.00, text: 2.00 };

// ─── GET /earn/tasks — Available tasks ────────────────────────────────────────
router.get('/tasks', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, type, title, instructions, reward, estimated_time, prompt, options
       FROM earn_tasks
       WHERE is_active = true
       ORDER BY type, id
       LIMIT 50`
    );
    res.json(result.rows);
  } catch (e) {
    console.error('earn/tasks error:', e);
    // Return demo tasks if table doesn't exist yet
    res.json([
      { id: 1, type: 'voice', title: 'Read a sentence', prompt: 'The quick brown fox jumps over the lazy dog.', reward: 5, estimated_time: '30 sec' },
      { id: 2, type: 'image', title: 'Label an image', question: 'What is shown in this image?', options: ['Person','Vehicle','Animal','Nature','Object','Food'], reward: 3, estimated_time: '15 sec' },
      { id: 3, type: 'text',  title: 'Sentiment analysis', prompt: 'The product quality was excellent and shipping was fast!', task_subtype: 'sentiment', reward: 2, estimated_time: '10 sec' },
    ]);
  }
});

// ─── GET /earn/wallet ─────────────────────────────────────────────────────────
router.get('/wallet', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [walletRes, statsRes, pendingRes] = await Promise.all([
      pool.query('SELECT wallet_balance FROM users WHERE user_id=$1', [userId]),
      pool.query(`SELECT COUNT(*) as tasks_completed, COALESCE(SUM(reward),0) as total_earned
                  FROM earn_submissions WHERE user_id=$1 AND status='approved'`, [userId]),
      pool.query(`SELECT COUNT(*) as pending_count FROM earn_submissions WHERE user_id=$1 AND status='pending'`, [userId]),
    ]);
    res.json({
      balance: parseFloat(walletRes.rows[0]?.wallet_balance) || 0,
      total_earned: parseFloat(statsRes.rows[0]?.total_earned) || 0,
      tasks_completed: parseInt(statsRes.rows[0]?.tasks_completed) || 0,
      pending_count: parseInt(pendingRes.rows[0]?.pending_count) || 0,
    });
  } catch (e) {
    console.error('earn/wallet error:', e);
    res.json({ balance: 0, total_earned: 0, tasks_completed: 0 });
  }
});

// ─── POST /earn/submit ────────────────────────────────────────────────────────
router.post('/submit', authMiddleware, submitLimiter, upload.single('file'), async (req, res) => {
  const userId   = req.user.userId;
  const { task_id, task_type, label } = req.body;

  if (!task_id || !task_type) return res.status(400).json({ error: 'task_id and task_type required' });
  if (!['voice', 'image', 'text'].includes(task_type)) return res.status(400).json({ error: 'Invalid task type' });

  // Basic quality checks
  if (task_type === 'voice') {
    if (!req.file) return res.status(400).json({ error: 'Audio file required for voice task' });
    if (req.file.size < 1000) return res.status(400).json({ error: 'Audio recording too short' });
  }
  if ((task_type === 'image' || task_type === 'text') && !label) {
    return res.status(400).json({ error: 'Label required' });
  }

  try {
    // Check for duplicate (same user + same task in last hour)
    const dupCheck = await pool.query(
      `SELECT id FROM earn_submissions
       WHERE user_id=$1 AND task_id=$2 AND submitted_at > NOW() - INTERVAL '1 hour'`,
      [userId, task_id]
    );
    if (dupCheck.rows.length > 0) return res.status(429).json({ error: 'Already submitted this task recently' });

    const reward  = REWARDS[task_type] || 2;
    // Upload file to Cloudinary (or base64 fallback) — never store on ephemeral disk
    const dataUrl = req.file
      ? await uploadEarnFile(req.file.buffer, req.file.originalname, req.file.mimetype)
      : null;

    // Insert submission — user_id and data stored SEPARATELY (privacy)
    const result = await pool.query(
      `INSERT INTO earn_submissions (user_id, task_id, task_type, data_url, label, reward, status, submitted_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW())
       RETURNING id`,
      [userId, task_id, task_type, dataUrl, label || null, reward]
    );

    res.json({ success: true, submission_id: result.rows[0].id, reward, message: `Task submitted! ₹${reward} will be added after review.` });
  } catch (e) {
    console.error('earn/submit error:', e);
    res.status(500).json({ error: 'Submission failed' });
  }
});

// ─── POST /earn/withdraw ──────────────────────────────────────────────────────
router.post('/withdraw', authMiddleware, async (req, res) => {
  const userId = req.user.userId;
  const { amount, upi_id } = req.body;

  if (!amount || amount < 10) return res.status(400).json({ error: 'Minimum withdrawal is ₹10' });
  if (!upi_id) return res.status(400).json({ error: 'UPI ID required' });

  try {
    const walletRes = await pool.query('SELECT wallet_balance FROM users WHERE user_id=$1', [userId]);
    const balance   = parseFloat(walletRes.rows[0]?.wallet_balance) || 0;

    if (amount > balance) return res.status(400).json({ error: `Insufficient balance (₹${balance} available)` });

    // Deduct balance and create withdrawal record
    await pool.query('BEGIN');
    await pool.query('UPDATE users SET wallet_balance = wallet_balance - $1 WHERE user_id=$2', [amount, userId]);
    await pool.query(
      `INSERT INTO earn_withdrawals (user_id, amount, upi_id, status, requested_at)
       VALUES ($1, $2, $3, 'pending', NOW())`,
      [userId, amount, upi_id]
    );
    await pool.query('COMMIT');

    res.json({ success: true, message: `₹${amount} withdrawal requested. Processing in 2–3 business days.` });
  } catch (e) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('earn/withdraw error:', e);
    res.status(500).json({ error: 'Withdrawal failed' });
  }
});

// ─── ADMIN: GET /earn/admin/submissions ───────────────────────────────────────
router.get('/admin/submissions', adminMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT es.id, es.task_type, es.label, es.reward, es.status, es.submitted_at,
              es.data_url, u.username
       FROM earn_submissions es
       JOIN users u ON u.id = es.user_id
       ORDER BY es.submitted_at DESC
       LIMIT 200`
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: POST /earn/admin/approve/:id ──────────────────────────────────────
router.post('/admin/approve/:id', adminMiddleware, async (req, res) => {
  const { id }     = req.params;
  const { action } = req.body; // 'approve' | 'reject'

  try {
    const subRes = await pool.query('SELECT * FROM earn_submissions WHERE id=$1', [id]);
    if (!subRes.rows.length) return res.status(404).json({ error: 'Submission not found' });

    const sub = subRes.rows[0];
    if (sub.status !== 'pending') return res.status(400).json({ error: 'Already processed' });

    await pool.query('BEGIN');
    await pool.query('UPDATE earn_submissions SET status=$1 WHERE id=$2', [action === 'approve' ? 'approved' : 'rejected', id]);

    if (action === 'approve') {
      await pool.query('UPDATE users SET wallet_balance = wallet_balance + $1 WHERE user_id=$2', [sub.reward, sub.user_id]);
    }
    await pool.query('COMMIT');

    res.json({ success: true, message: `Submission ${action}d` });
  } catch (e) {
    await pool.query('ROLLBACK').catch(() => {});
    res.status(500).json({ error: e.message });
  }
});

// ─── ADMIN: GET /earn/admin/export ────────────────────────────────────────────
router.get('/admin/export', adminMiddleware, async (req, res) => {
  const { format = 'json', type } = req.query;
  try {
    let query = `SELECT es.id, es.task_type, es.label, es.data_url, es.submitted_at
                 FROM earn_submissions es
                 WHERE es.status='approved'`;
    const params = [];
    if (type) { query += ` AND es.task_type=$1`; params.push(type); }
    query += ' ORDER BY es.submitted_at DESC';

    const result = await pool.query(query, params);
    const data   = result.rows;

    if (format === 'csv') {
      const header = 'id,task_type,label,data_url,submitted_at\n';
      const rows   = data.map(r => `${r.id},${r.task_type},"${r.label || ''}",${r.data_url || ''},${r.submitted_at}`).join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="earn_dataset.csv"');
      return res.send(header + rows);
    }

    res.setHeader('Content-Disposition', 'attachment; filename="earn_dataset.json"');
    res.json({ exported_at: new Date().toISOString(), total: data.length, data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
