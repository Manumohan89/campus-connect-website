const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const crypto = require('crypto');

// Plans configuration
const PLANS = {
  premium_monthly: { name: 'Premium Monthly', amount: 19900, currency: 'INR', duration_days: 30, features: ['Unlimited AI Tutor', 'All VTU Resources', 'Unlimited coding submissions', 'Resume AI enhance', 'Priority placement alerts'] },
  premium_yearly:  { name: 'Premium Yearly',  amount: 149900, currency: 'INR', duration_days: 365, features: ['Everything in Monthly', '4 months FREE', 'College leaderboard', 'Mock interview AI'] },
};

// Initialize Razorpay only if key exists
let razorpay = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const Razorpay = require('razorpay');
    razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  }
} catch (e) { console.warn('Razorpay not configured:', e.message); }

// ── GET /api/payments/plans ──────────────────────────────────────────────────
router.get('/plans', (req, res) => {
  res.json({ plans: PLANS, razorpay_enabled: !!razorpay, razorpay_key: process.env.RAZORPAY_KEY_ID || '' });
});

// ── POST /api/payments/create-order ─────────────────────────────────────────
router.post('/create-order', authMiddleware, async (req, res) => {
  const { plan_id } = req.body;
  const plan = PLANS[plan_id];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured. Contact admin.' });

  try {
    const order = await razorpay.orders.create({
      amount: plan.amount,
      currency: plan.currency,
      receipt: `cc_${req.user.userId}_${Date.now()}`,
      notes: { user_id: req.user.userId, plan_id },
    });
    // Log pending payment
    await pool.query(
      'INSERT INTO payment_logs (user_id, type, amount_paise, status, gateway_order_id, metadata) VALUES ($1,$2,$3,$4,$5,$6)',
      [req.user.userId, 'subscription', plan.amount, 'pending', order.id, JSON.stringify({ plan_id })]
    );
    res.json({ order_id: order.id, amount: plan.amount, currency: plan.currency, plan });
  } catch (e) { console.error('Create order error:', e); res.status(500).json({ error: 'Failed to create order' }); }
});

// ── POST /api/payments/verify ────────────────────────────────────────────────
router.post('/verify', authMiddleware, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan_id } = req.body;
  if (!razorpay) return res.status(503).json({ error: 'Payment gateway not configured' });

  // Verify signature
  const expectedSig = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSig !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed — invalid signature' });
  }

  const plan = PLANS[plan_id];
  if (!plan) return res.status(400).json({ error: 'Invalid plan' });

  const expiresAt = new Date(Date.now() + plan.duration_days * 86400000);

  try {
    await pool.query('BEGIN');
    // Update user subscription
    await pool.query(
      `UPDATE users SET subscription_tier='premium', subscription_expires_at=$1 WHERE user_id=$2`,
      [expiresAt, req.user.userId]
    );
    // Create subscription record
    await pool.query(
      `INSERT INTO subscriptions (user_id, plan, status, razorpay_order_id, razorpay_payment_id, amount_paise, expires_at)
       VALUES ($1,$2,'active',$3,$4,$5,$6)`,
      [req.user.userId, plan_id, razorpay_order_id, razorpay_payment_id, plan.amount, expiresAt]
    );
    // Update payment log
    await pool.query(
      'UPDATE payment_logs SET status=$1, gateway_payment_id=$2 WHERE gateway_order_id=$3',
      ['completed', razorpay_payment_id, razorpay_order_id]
    );
    await pool.query('COMMIT');
    // Send notification
    await pool.query(
      'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
      [req.user.userId, 'announcement', '🎉 Premium Activated!',
       `Your ${plan.name} subscription is now active until ${expiresAt.toLocaleDateString('en-IN')}.`, '/dashboard']
    );
    res.json({ success: true, expires_at: expiresAt, plan: plan.name });
  } catch (e) {
    await pool.query('ROLLBACK');
    console.error('Payment verify error:', e);
    res.status(500).json({ error: 'Failed to activate subscription' });
  }
});

// ── GET /api/payments/subscription ──────────────────────────────────────────
router.get('/subscription', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT subscription_tier, subscription_expires_at FROM users WHERE user_id=$1',
      [req.user.userId]
    );
    const u = result.rows[0];
    const isActive = u.subscription_tier === 'premium' && new Date(u.subscription_expires_at) > new Date();
    res.json({
      tier: isActive ? 'premium' : 'free',
      expires_at: u.subscription_expires_at,
      is_active: isActive,
      days_left: isActive ? Math.ceil((new Date(u.subscription_expires_at) - new Date()) / 86400000) : 0,
    });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Webhook (Razorpay calls this on payment events) ──────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  if (!process.env.RAZORPAY_WEBHOOK_SECRET || !sig) return res.status(200).json({ received: true });
  try {
    const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(req.body).digest('hex');
    if (expectedSig !== sig) return res.status(400).json({ error: 'Invalid signature' });
    const event = JSON.parse(req.body.toString());
    console.log('Razorpay webhook event:', event.event);
    res.json({ received: true });
  } catch (e) { res.status(400).json({ error: 'Webhook error' }); }
});

module.exports = router;
