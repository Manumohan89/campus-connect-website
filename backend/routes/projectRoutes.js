const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch (e) { console.warn('Razorpay not configured:', e.message); }

// ── GET /api/projects — list active projects ─────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search, level } = req.query;
    let q = 'SELECT * FROM project_listings WHERE is_active = true';
    const params = [];
    if (category && category !== 'all') { params.push(category); q += ` AND category = $${params.length}`; }
    if (level && level !== 'all') { params.push(level); q += ` AND level = $${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`; }
    q += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── GET /api/projects/my-purchases — user's purchased projects ────────────────
router.get('/my-purchases', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT pp.*, pl.title, pl.description, pl.tech_stack, pl.category, pl.download_url, pl.preview_url
       FROM project_purchases pp
       JOIN project_listings pl ON pl.id = pp.project_id
       WHERE pp.user_id = $1 AND pp.status = 'completed'
       ORDER BY pp.purchased_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── POST /api/projects/:id/create-order — initiate payment ───────────────────
router.post('/:id/create-order', authMiddleware, async (req, res) => {
  try {
    // Ensure tables exist (safe to run multiple times)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_listings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tech_stack TEXT[],
        category VARCHAR(100),
        level VARCHAR(50) DEFAULT 'intermediate',
        price_paise INTEGER DEFAULT 0,
        preview_url TEXT,
        download_url TEXT,
        thumbnail_url TEXT,
        tags TEXT[],
        is_active BOOLEAN DEFAULT TRUE,
        downloads_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS project_purchases (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES project_listings(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
        amount_paise INTEGER NOT NULL DEFAULT 0,
        payment_id VARCHAR(255),
        order_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'pending',
        purchased_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(project_id, user_id)
      )
    `);

    const { rows: proj } = await pool.query(
      'SELECT * FROM project_listings WHERE id = $1 AND is_active = true',
      [req.params.id]
    );
    if (!proj.length) return res.status(404).json({ error: 'Project not found' });
    const project = proj[0];

    // Free project → grant access directly without payment
    if (!project.price_paise || project.price_paise === 0) {
      await pool.query(
        `INSERT INTO project_purchases (project_id, user_id, amount_paise, status)
         VALUES ($1, $2, 0, 'completed')
         ON CONFLICT (project_id, user_id) DO UPDATE SET status = 'completed'`,
        [project.id, req.user.userId]
      );
      return res.json({ free: true, download_url: project.download_url });
    }

    // Paid project → create Razorpay order
    if (!razorpay) {
      return res.status(503).json({ error: 'Payment gateway not configured. Contact admin to enable payments.' });
    }
    const order = await razorpay.orders.create({
      amount: project.price_paise,
      currency: 'INR',
      receipt: `proj_${req.user.userId}_${project.id}_${Date.now()}`,
      notes: { user_id: String(req.user.userId), project_id: String(project.id) },
    });
    await pool.query(
      `INSERT INTO project_purchases (project_id, user_id, amount_paise, order_id, status)
       VALUES ($1, $2, $3, $4, 'pending')
       ON CONFLICT (project_id, user_id) DO UPDATE SET order_id = $4, status = 'pending'`,
      [project.id, req.user.userId, project.price_paise, order.id]
    );
    res.json({ order_id: order.id, amount: project.price_paise, currency: 'INR', project_title: project.title });
  } catch (e) {
    console.error('create-order error:', e.message);
    // Check if it's a table-not-found error (migration not yet run)
    if (e.message?.includes('relation') && e.message?.includes('does not exist')) {
      return res.status(503).json({ error: 'Projects feature is being set up. Please try again in a moment.' });
    }
    res.status(500).json({ error: 'Failed to create order. Please try again.' });
  }
});

// ── POST /api/projects/verify-payment — confirm payment & grant access ────────
router.post('/verify-payment', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, project_id } = req.body;
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });
  try {
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ error: 'Invalid payment signature' });

    await pool.query(
      `UPDATE project_purchases SET status = 'completed', payment_id = $1
       WHERE order_id = $2 AND user_id = $3`,
      [razorpay_payment_id, razorpay_order_id, req.user.userId]
    );
    // Increment download count
    await pool.query('UPDATE project_listings SET downloads_count = downloads_count + 1 WHERE id = $1', [project_id]);

    const { rows } = await pool.query('SELECT download_url FROM project_listings WHERE id = $1', [project_id]);
    res.json({ success: true, download_url: rows[0]?.download_url });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Payment verification failed' }); }
});

// ── GET /api/projects/custom — list user's custom requests ───────────────────
router.get('/custom', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM custom_project_requests WHERE user_id = $1 ORDER BY submitted_at DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── POST /api/projects/custom — submit custom project request ─────────────────
router.post('/custom', authMiddleware, async (req, res) => {
  const { title, description, tech_preferences, deadline, budget_paise } = req.body;
  if (!title || !description) return res.status(400).json({ error: 'Title and description required' });
  try {
    const { rows } = await pool.query(
      `INSERT INTO custom_project_requests (user_id, title, description, tech_preferences, deadline, budget_paise)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [req.user.userId, title, description, tech_preferences || null, deadline || null, budget_paise || null]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── POST /api/projects/custom/:id/pay — pay for custom project ───────────────
router.post('/custom/:id/pay', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM custom_project_requests WHERE id = $1 AND user_id = $2', [req.params.id, req.user.userId]);
    if (!rows.length) return res.status(404).json({ error: 'Request not found' });
    const req_ = rows[0];
    if (req_.status !== 'quoted') return res.status(400).json({ error: 'Not ready for payment' });
    if (!req_.final_price_paise) return res.status(400).json({ error: 'Price not set by admin' });
    if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });

    const order = await razorpay.orders.create({
      amount: req_.final_price_paise,
      currency: 'INR',
      receipt: `custom_${req.user.userId}_${req_.id}_${Date.now()}`,
    });
    await pool.query(
      'UPDATE custom_project_requests SET order_id = $1, status = $2, updated_at = NOW() WHERE id = $3',
      [order.id, 'payment_pending', req_.id]
    );
    res.json({ order_id: order.id, amount: req_.final_price_paise, currency: 'INR' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create order' }); }
});

// ── POST /api/projects/custom/verify-payment ────────────────────────────────
router.post('/custom/verify-payment', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, request_id } = req.body;
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });
  try {
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');
    if (expectedSig !== razorpay_signature) return res.status(400).json({ error: 'Invalid signature' });

    await pool.query(
      `UPDATE custom_project_requests SET status = 'in_progress', payment_id = $1, order_id = $2, updated_at = NOW()
       WHERE id = $3 AND user_id = $4`,
      [razorpay_payment_id, razorpay_order_id, request_id, req.user.userId]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: 'Verification failed' }); }
});

module.exports = router;
