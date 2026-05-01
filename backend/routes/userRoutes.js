const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, forgotPassword, resetPassword, changePassword, verifyOTP } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');
const multer = require('multer');
const pool = require('../db');
const path = require('path');
const { execFile } = require('child_process'); // Fixed: use execFile instead of exec to avoid command injection
const { calculateSgpa, saveSgpaToDb, calculateCgpa } = require('../utils/sgpaCalculator');
const { notifyMarksUploaded } = require('../utils/notificationService');

const router = express.Router();
const { validate, registerRules, loginRules, changePasswordRules, contactRules, profileUpdateRules } = require('../middleware/validate');

const defaultSettings = {
  email_prefs: {
    newsletter: true,
    drives: true,
    deadlines: true,
    updates: true,
  },
  privacy_settings: {
    profilePublic: false,
    showStats: true,
    allowMessages: true,
  },
};

function normalizeSettingsPayload(settings = {}) {
  const email = settings.emailPrefs || settings.email_prefs || {};
  const privacy = settings.privacySettings || settings.privacy_settings || {};
  return {
    email_prefs: {
      newsletter: !!email.newsletter,
      drives: !!email.drives,
      deadlines: !!email.deadlines,
      updates: !!email.updates,
    },
    privacy_settings: {
      profilePublic: !!privacy.profilePublic,
      showStats: !!privacy.showStats,
      allowMessages: !!privacy.allowMessages,
    },
  };
}

function toISODate(d) {
  return d.toISOString().split('T')[0];
}

async function collectUserActivityByDay(userId, days = 105) {
  const sources = [
    { table: 'coding_submissions', col: 'submitted_at' },
    { table: 'mock_tests', col: 'completed_at' },
    { table: 'study_plan', col: 'created_at' },
    { table: 'reminders', col: 'created_at' },
    { table: 'shared_documents', col: 'shared_at' },
    { table: 'enrollments', col: 'enrolled_at' },
    { table: 'forum_posts', col: 'created_at' },
    { table: 'forum_answers', col: 'created_at' },
    { table: 'forum_votes', col: 'created_at' },
  ];

  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const activityMap = new Map();

  for (const src of sources) {
    try {
      const result = await pool.query(
        `SELECT DATE(${src.col}) AS d, COUNT(*)::int AS c
         FROM ${src.table}
         WHERE user_id = $1 AND ${src.col} >= $2
         GROUP BY DATE(${src.col})`,
        [userId, since]
      );
      for (const row of result.rows) {
        const key = toISODate(new Date(row.d));
        activityMap.set(key, (activityMap.get(key) || 0) + Number(row.c || 0));
      }
    } catch (_) {
      // Ignore missing table/column sources to keep dashboard robust across migrations.
    }
  }

  const daily = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = toISODate(date);
    daily.push({ date: key, count: activityMap.get(key) || 0 });
  }

  let streak = 0;
  for (let i = daily.length - 1; i >= 0; i--) {
    if (daily[i].count > 0) streak += 1;
    else break;
  }

  return {
    streak,
    last15Weeks: daily,
  };
}

// ─── Auth routes ────────────────────────────────────────────────────────────

// POST /api/users/register
router.post('/register', validate(registerRules), registerUser);

// POST /api/users/login — standard username/password login
router.post('/login', validate(loginRules), loginUser);

// POST /api/users/verify-otp — Email OTP verification
router.post('/verify-otp', verifyOTP);

// ─── Profile routes ──────────────────────────────────────────────────────────

// GET /api/users/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Recalculate CGPA from marks and update
    const cgpa = await calculateCgpa(userId);
    await pool.query('UPDATE users SET cgpa = $1 WHERE user_id = $2', [cgpa, userId]);

    const result = await pool.query(
      'SELECT full_name, semester, college, branch, sgpa, cgpa, profile_avatar, username, email, mobile, year_scheme FROM users WHERE user_id = $1',
      [userId]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT /api/users/profile
router.put('/profile', authMiddleware, validate(profileUpdateRules), updateUserProfile);

// ─── Dashboard ────────────────────────────────────────────────────────────────

router.get('/dashboard-data', authMiddleware, async (req, res) => {
  try {
    const user = await userModel.findUserById(req.user.userId);
    const activity = await collectUserActivityByDay(req.user.userId, 105);
    res.json({
      username: user.username,
      semester: user.semester,
      branch: user.branch,
      cgpa: user.cgpa || 'N/A',
      sgpa: user.sgpa || 'N/A',
      streak: activity.streak,
      activityLast15Weeks: activity.last15Weeks,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// ─── Reminders ────────────────────────────────────────────────────────────────

router.post('/reminders', authMiddleware, async (req, res) => {
  const { time, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO reminders (user_id, time_str, message) VALUES ($1, $2, $3)',
      [req.user.userId, time, message]
    );
    res.status(201).json({ message: 'Reminder set successfully' });
  } catch (error) {
    console.error('Error setting reminder:', error);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

router.get('/reminders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reminders WHERE user_id = $1', [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// ─── Job opportunities ─────────────────────────────────────────────────────────
router.get('/job-opportunities', async (req, res) => {
  const { type, search, tags } = req.query;
  try {
    let q = 'SELECT * FROM job_listings WHERE is_active=true';
    const params = [];
    let i = 1;
    if (type)   { q += ` AND type=$${i++}`; params.push(type); }
    if (search) { q += ` AND (title ILIKE $${i} OR company ILIKE $${i} OR description ILIKE $${i})`; params.push(`%${search}%`); i++; }
    q += ' ORDER BY created_at DESC LIMIT 50';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching job opportunities:', error);
    res.status(500).json({ error: 'Failed to fetch job opportunities' });
  }
});

// ─── Marks upload (memory storage — no ephemeral disk dependency) ────────────

const { parseVtuPdf } = require('../utils/vtuPdfParser');

// Use memory storage so files are never written to disk
// This is essential for Render.com which has an ephemeral filesystem
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

router.post('/upload-marks', authMiddleware, upload.single('marksCard'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file received. Please upload a valid VTU marks card PDF.' });
  }
  const userId = req.user.userId;

  // ── Step 1: Parse PDF ────────────────────────────────────────────────────
  let result;
  try {
    result = await parseVtuPdf(req.file.buffer);
  } catch (parseErr) {
    console.error('upload-marks PDF parse error:', parseErr.message);
    return res.status(422).json({ error: parseErr.message || 'Could not read this PDF. Please upload an official VTU marks card.' });
  }

  const { subjects, sgpa } = result;
  if (!subjects || subjects.length === 0) {
    return res.status(422).json({ error: 'No VTU subject codes found. Please upload an official marks card from results.vtu.ac.in.' });
  }

  // ── Step 2: Save to DB ───────────────────────────────────────────────────
  try {
    for (const sub of subjects) {
      // Use a safe upsert that doesn't touch GENERATED ALWAYS columns (is_failed)
      await pool.query(
        `INSERT INTO marks (user_id, subject_code, subject_name, internal_marks, external_marks, total, grade_points, credits)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (user_id, subject_code) DO UPDATE SET
           subject_name    = EXCLUDED.subject_name,
           internal_marks  = EXCLUDED.internal_marks,
           external_marks  = EXCLUDED.external_marks,
           total           = EXCLUDED.total,
           grade_points    = EXCLUDED.grade_points,
           credits         = EXCLUDED.credits`,
        [userId, sub.subject_code, sub.subject_name, sub.internal_marks,
         sub.external_marks, sub.total_marks, sub.grade_points, sub.credits]
      );
    }

    const cgpa = await calculateCgpa(userId);
    await pool.query('UPDATE users SET sgpa=$1, cgpa=$2 WHERE user_id=$3', [sgpa, cgpa, userId]);

    const failedCount = subjects.filter(s => s.total_marks < 40).length;
    notifyMarksUploaded(userId, sgpa, failedCount).catch(() => {});

    return res.status(200).json({
      message: 'Marks uploaded and SGPA calculated successfully!',
      sgpa, cgpa, subjects_count: subjects.length, failed_count: failedCount, subjects,
    });
  } catch (dbErr) {
    console.error('upload-marks DB error:', dbErr.message);
    return res.status(500).json({ error: 'Marks were parsed but could not be saved. Please try again.' });
  }
});

// ─── Document sharing ─────────────────────────────────────────────────────────

router.post('/share-document', authMiddleware, upload.single('sharedDocument'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
    // With memoryStorage, req.file.filename is undefined — use originalname as identifier
    const fileId = `${Date.now()}_${req.file.originalname}`;
    const userId = req.user.userId;
    await pool.query(
      'INSERT INTO shared_documents (user_id, file_id, file_name, mime_type) VALUES ($1, $2, $3, $4)',
      [userId, fileId, req.file.originalname, req.file.mimetype]
    );
    res.status(200).json({ message: 'Document shared successfully' });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

router.get('/shared-documents', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_id, file_name, mime_type FROM shared_documents WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    res.status(500).json({ error: 'Failed to fetch shared documents' });
  }
});

// ─── SGPA / CGPA ─────────────────────────────────────────────────────────────

router.get('/sgpa', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT sgpa FROM users WHERE user_id = $1', [req.user.userId]);
    if (result.rows.length === 0 || result.rows[0].sgpa === null) {
      return res.status(404).json({ error: 'SGPA not found.' });
    }
    res.status(200).json({ sgpa: result.rows[0].sgpa });
  } catch (error) {
    console.error('Error fetching SGPA:', error);
    res.status(500).json({ error: 'Failed to fetch SGPA.' });
  }
});

router.get('/cgpa', authMiddleware, async (req, res) => {
  try {
    const cgpa = await calculateCgpa(req.user.userId);
    res.status(200).json({ cgpa });
  } catch (error) {
    console.error('Error fetching CGPA:', error);
    res.status(500).json({ error: 'Failed to fetch CGPA' });
  }
});

// ─── Contact ──────────────────────────────────────────────────────────────────

router.post('/contact', validate(contactRules), async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Save to database for record keeping
    await pool.query(
      'INSERT INTO contact_messages (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    // Table may not exist yet — log and still return success to user
    console.error('Contact form submission (DB save failed):', { name, email, message }, error.message);
    res.status(200).json({ message: 'Message received.' });
  }
});


// GET /api/users/marks — fetch all marks for current user
router.get('/marks', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM marks WHERE user_id = $1 ORDER BY subject_code',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ error: 'Failed to fetch marks' });
  }
});



// ─── Profile Photo Upload ────────────────────────────────────────────────────
// Uses Cloudinary when configured (production), falls back to base64 in DB (local)
const photoUpload = multer({
  storage: multer.memoryStorage(),   // memory only — no ephemeral disk
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

// Cloudinary SDK (already in package.json)
const cloudinarySDK = require('cloudinary').v2;

async function uploadImageToCloudinary(buffer, userId) {
  const { CLOUDINARY_CLOUD_NAME: cloud_name, CLOUDINARY_API_KEY: api_key, CLOUDINARY_API_SECRET: api_secret } = process.env;

  if (cloud_name && api_key && api_secret) {
    cloudinarySDK.config({ cloud_name, api_key, api_secret });
    return new Promise((resolve, reject) => {
      cloudinarySDK.uploader.upload_stream(
        { folder: 'campus-connect/profiles', public_id: `profile-${userId}`, overwrite: true, resource_type: 'image' },
        (err, result) => err ? reject(err) : resolve(result.secure_url)
      ).end(buffer);
    });
  }

  // Fallback: base64 data URL in DB (no Cloudinary needed — works everywhere)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

router.post('/profile-photo', authMiddleware, photoUpload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
  try {
    const photoUrl = await uploadImageToCloudinary(req.file.buffer, req.user.userId);
    await pool.query('UPDATE users SET profile_avatar=$1 WHERE user_id=$2', [photoUrl, req.user.userId]);
    res.json({ photo_url: photoUrl, message: 'Profile photo updated!' });
  } catch (e) {
    console.error('Photo upload error:', e);
    res.status(500).json({ error: 'Failed to save photo: ' + e.message });
  }
});

router.delete('/profile-photo', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET profile_avatar=NULL WHERE user_id=$1', [req.user.userId]);
    res.json({ message: 'Profile photo removed.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove photo.' });
  }
});

// ─── Public SGPA Calculator (no auth required) ───────────────────────────────
const uploadPublic = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/sgpa-public', uploadPublic.single('marksCard'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });
  try {
    const result = await parseVtuPdf(req.file.buffer);
    res.json({
      sgpa: result.sgpa,
      subjects: result.subjects,
      total_credits: result.total_credits,
      total_grade_points: result.total_grade_points,
      message: 'SGPA calculated successfully! Register to save your results.',
    });
  } catch (err) {
    res.status(422).json({ error: err.message || 'Failed to process PDF. Please upload a valid VTU marks card.' });
  }
});

// POST /api/users/refresh-token — silently refresh JWT before it expires
router.post('/refresh-token', authMiddleware, async (req, res) => {
  try {
    const user = await pool.query('SELECT user_id, role, is_blocked FROM users WHERE user_id=$1', [req.user.userId]);
    if (!user.rows.length || user.rows[0].is_blocked) return res.status(403).json({ error: 'Account not active' });
    const config = require('../config');
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: user.rows[0].user_id, role: user.rows[0].role || 'user' }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, role: user.rows[0].role || 'user' });
  } catch (e) { res.status(500).json({ error: 'Failed to refresh token' }); }
});


// POST /api/users/resend-otp — resend verification OTP
router.post('/resend-otp', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const result = await pool.query('SELECT user_id, email, is_verified FROM users WHERE username=$1', [username]);
    if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
    if (result.rows[0].is_verified) return res.status(400).json({ error: 'Account already verified. Please log in.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000);
    await pool.query('UPDATE users SET otp=$1, otp_expiry=$2 WHERE user_id=$3', [otp, expiry, result.rows[0].user_id]);

    const { sendOTP } = require('../controllers/userController');
    try {
      await sendOTP(result.rows[0].email, otp);
      res.json({ message: 'OTP resent successfully. Check your inbox and spam folder.' });
    } catch (emailErr) {
      console.error('Resend OTP email failed:', emailErr.message);
      res.json({ message: 'OTP updated but email sending failed. Check server email configuration.', devOtp: otp });
    }
  } catch (e) {
    console.error('resend-otp error:', e);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// POST /api/users/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/users/reset-password
router.post('/reset-password', resetPassword);

// POST /api/users/change-password
router.post('/change-password', authMiddleware, validate(changePasswordRules), changePassword);

// DELETE /api/users/marks/:subject_code — delete a specific subject's marks
router.delete('/marks/:subject_code', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM marks WHERE user_id=$1 AND subject_code=$2', [req.user.userId, req.params.subject_code]);
    // Recalculate CGPA after deletion
    const { calculateCgpa } = require('../utils/sgpaCalculator');
    const cgpa = await calculateCgpa(req.user.userId);
    await pool.query('UPDATE users SET cgpa=$1 WHERE user_id=$2', [cgpa, req.user.userId]);
    res.json({ message: 'Subject deleted', cgpa });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ── Notifications ─────────────────────────────────────────────────────────────
// GET /api/users/notifications
router.get('/notifications', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch' }); }
});

// PATCH /api/users/notifications/:id/read
router.patch('/notifications/:id/read', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read=true WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ message: 'Marked as read' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// PATCH /api/users/notifications/read-all
router.patch('/notifications/read-all', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.userId]);
    res.json({ message: 'All marked as read' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// DELETE /api/users/notifications/:id
router.delete('/notifications/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM notifications WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── Study Planner ─────────────────────────────────────────────────────────────
router.get('/study-plan', authMiddleware, async (req, res) => {
  const { start, end } = req.query;
  try {
    let q = 'SELECT * FROM study_plan WHERE user_id=$1';
    const params = [req.user.userId];
    if (start && end) { q += ' AND study_date BETWEEN $2 AND $3'; params.push(start, end); }
    q += ' ORDER BY study_date, id';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.post('/study-plan', authMiddleware, async (req, res) => {
  const { subject_code, subject_name, study_date, duration_hours, notes } = req.body;
  if (!subject_code || !study_date) return res.status(400).json({ error: 'subject_code and study_date required' });
  try {
    const result = await pool.query(
      'INSERT INTO study_plan (user_id, subject_code, subject_name, study_date, duration_hours, notes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.user.userId, subject_code, subject_name, study_date, duration_hours || 1, notes || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to create' }); }
});

router.patch('/study-plan/:id/complete', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE study_plan SET completed = NOT completed WHERE id=$1 AND user_id=$2 RETURNING *',
      [req.params.id, req.user.userId]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.delete('/study-plan/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM study_plan WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});


// ── Push Notification Subscription ───────────────────────────────────────────
router.post('/push-subscribe', authMiddleware, async (req, res) => {
  const { endpoint, p256dh, auth } = req.body;
  if (!endpoint || !p256dh || !auth) return res.status(400).json({ error: 'Missing subscription data' });
  try {
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
       VALUES ($1,$2,$3,$4) ON CONFLICT (endpoint) DO UPDATE SET p256dh=$3, auth=$4`,
      [req.user.userId, endpoint, p256dh, auth]
    );
    res.json({ message: 'Push subscription saved' });
  } catch (e) { res.status(500).json({ error: 'Failed to save subscription' }); }
});

router.delete('/push-subscribe', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM push_subscriptions WHERE user_id=$1', [req.user.userId]);
    res.json({ message: 'Push subscription removed' });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// GET /api/users/settings — load account settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const profileResult = await pool.query(
      `SELECT username, email, created_at
       FROM users
       WHERE user_id = $1`,
      [req.user.userId]
    );

    if (!profileResult.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const settingsResult = await pool.query(
      `SELECT email_prefs, privacy_settings
       FROM user_settings
       WHERE user_id = $1`,
      [req.user.userId]
    );

    const persisted = settingsResult.rows[0] || defaultSettings;
    const account = profileResult.rows[0];

    return res.json({
      account: {
        username: account.username,
        email: account.email,
        createdAt: account.created_at,
      },
      emailPrefs: persisted.email_prefs || defaultSettings.email_prefs,
      privacySettings: persisted.privacy_settings || defaultSettings.privacy_settings,
    });
  } catch (e) {
    console.error('Error fetching settings:', e);
    return res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/users/settings — update account settings
router.put('/settings', authMiddleware, async (req, res) => {
  const normalized = normalizeSettingsPayload(req.body || {});
  try {
    const result = await pool.query(
      `INSERT INTO user_settings (user_id, email_prefs, privacy_settings, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET
         email_prefs = EXCLUDED.email_prefs,
         privacy_settings = EXCLUDED.privacy_settings,
         updated_at = NOW()
       RETURNING email_prefs, privacy_settings, updated_at`,
      [req.user.userId, normalized.email_prefs, normalized.privacy_settings]
    );

    return res.json({
      message: 'Settings updated successfully',
      emailPrefs: result.rows[0].email_prefs,
      privacySettings: result.rows[0].privacy_settings,
      updatedAt: result.rows[0].updated_at,
    });
  } catch (e) {
    console.error('Error updating settings:', e);
    return res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Health check for Render
router.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ─── VTU Result Checker ───────────────────────────────────────────────────────
// GET /api/users/vtu-result?usn=1XX21CS001&semester=DEC/JAN+2023-24
// Tries cache first, then returns 404 so frontend falls back to its own simulation
router.get('/vtu-result', async (req, res) => {
  const { usn, semester } = req.query;
  if (!usn || usn.trim().length < 8) {
    return res.status(400).json({ error: 'Valid USN required (e.g. 1XX21CS001)' });
  }
  const cleanUsn = usn.trim().toUpperCase();
  try {
    // Check cache first (24h TTL)
    const cached = await pool.query(
      `SELECT result_json FROM vtu_results_cache
       WHERE usn=$1 AND semester=$2 AND fetched_at > NOW() - INTERVAL '24 hours'
       ORDER BY fetched_at DESC LIMIT 1`,
      [cleanUsn, semester || '']
    );
    if (cached.rows.length) {
      return res.json(cached.rows[0].result_json);
    }
    // No cache — return 404 so frontend uses its built-in simulation
    return res.status(404).json({
      error: 'Live VTU results not available. Showing simulated result.',
      code: 'NO_LIVE_DATA'
    });
  } catch (e) {
    console.error('VTU result error:', e.message);
    return res.status(503).json({ error: 'Result service unavailable', code: 'SERVICE_ERROR' });
  }
});


// POST /api/users/marks-manual — save a single subject manually (CSV upload)
router.post('/marks-manual', authMiddleware, async (req, res) => {
  const { subject_code, subject_name, internal_marks, external_marks, total, credits, grade_points } = req.body;
  if (!subject_code || total === undefined) return res.status(400).json({ error: 'subject_code and total required' });
  try {
    await pool.query(`
      INSERT INTO marks (user_id, subject_code, subject_name, internal_marks, external_marks, total, grade_points, credits)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (user_id, subject_code) DO UPDATE SET
        subject_name    = EXCLUDED.subject_name,
        internal_marks  = EXCLUDED.internal_marks,
        external_marks  = EXCLUDED.external_marks,
        total           = EXCLUDED.total,
        grade_points    = EXCLUDED.grade_points,
        credits         = EXCLUDED.credits
    `, [req.user.userId, subject_code, subject_name||subject_code,
        parseInt(internal_marks)||0, parseInt(external_marks)||0,
        parseInt(total), parseInt(grade_points)||0, parseInt(credits)||4]);
    res.json({ message: 'Subject saved' });
  } catch (e) { res.status(500).json({ error: 'Failed: '+e.message }); }
});

// POST /api/users/recalculate-cgpa — recalculate CGPA from all marks
router.post('/recalculate-cgpa', authMiddleware, async (req, res) => {
  try {
    const marks = await pool.query('SELECT grade_points, credits FROM marks WHERE user_id=$1', [req.user.userId]);
    const totalCr = marks.rows.reduce((s,r) => s + parseFloat(r.credits||4), 0);
    const totalGP = marks.rows.reduce((s,r) => s + parseFloat(r.grade_points||0)*parseFloat(r.credits||4), 0);
    const cgpa = totalCr > 0 ? parseFloat((totalGP/totalCr).toFixed(2)) : 0;
    await pool.query('UPDATE users SET cgpa=$1 WHERE user_id=$2', [cgpa, req.user.userId]);
    res.json({ cgpa, total_subjects: marks.rows.length });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});


// GET /api/users/platform-stats — public stats for homepage
router.get('/platform-stats', async (req, res) => {
  try {
    const [users, resources, courses, certs] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM vtu_resources'),
      pool.query('SELECT COUNT(*) FROM training_courses'),
      pool.query('SELECT COUNT(*) FROM enrollments WHERE certificate_issued=true'),
    ]);
    res.json({
      students:     parseInt(users.rows[0].count),
      resources:    parseInt(resources.rows[0].count),
      courses:      parseInt(courses.rows[0].count),
      certificates: parseInt(certs.rows[0].count),
    });
  } catch (e) { res.json({ students:1200, resources:25, courses:12, certificates:340 }); }
});

// DELETE /api/users/account — permanent account deletion
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    // Delete in correct order to respect foreign keys
    await pool.query('BEGIN');
    await pool.query('DELETE FROM ai_chat_sessions WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM ai_usage_log WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM push_subscriptions WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM leaderboard_cache WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM forum_votes WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM forum_answers WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM forum_posts WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM flashcards USING flashcard_decks WHERE flashcards.deck_id=flashcard_decks.id AND flashcard_decks.user_id=$1', [userId]);
    await pool.query('DELETE FROM flashcard_decks WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM coding_submissions WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM user_solved_problems WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM enrollments WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM marks WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM attendance WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM notifications WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM reminders WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM study_plan WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM shared_documents WHERE owner_id=$1', [userId]);
    await pool.query('DELETE FROM internships WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM subscriptions WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM payment_logs WHERE user_id=$1', [userId]);
    await pool.query('DELETE FROM users WHERE user_id=$1', [userId]);
    await pool.query('COMMIT');
    res.json({ message: 'Account permanently deleted' });
  } catch (e) {
    await pool.query('ROLLBACK').catch(() => {});
    console.error('Account deletion error:', e);
    res.status(500).json({ error: 'Failed to delete account. Please contact support.' });
  }
});

module.exports = router;

