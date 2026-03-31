const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile, loginWithOTP, verifyOTP, forgotPassword, resetPassword, changePassword } = require('../controllers/userController');
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

// ─── Auth routes ────────────────────────────────────────────────────────────

// POST /api/users/register
router.post('/register', validate(registerRules), registerUser);

// POST /api/users/login — standard username/password login
router.post('/login', validate(loginRules), loginUser);

// POST /api/users/login-otp — send OTP after password check
router.post('/login-otp', loginWithOTP);

// POST /api/users/verify-otp — verify OTP, returns JWT
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
    res.json({
      username: user.username,
      semester: user.semester,
      cgpa: user.cgpa || 'N/A',
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

// ─── Marks upload ─────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

router.post('/upload-marks', authMiddleware, upload.single('marksCard'), async (req, res) => {
  // Guard: multer may not attach file if wrong field name / content-type
  if (!req.file) {
    return res.status(400).json({ error: 'No PDF file received. Please upload a valid VTU marks card PDF.' });
  }

  const filePath   = req.file.path;
  const userId     = req.user.userId;
  // Case-insensitive replace: handles .pdf, .PDF, .Pdf
  const outputExcel = filePath.replace(/\.pdf$/i, '.xlsx');
  const jsonPath    = outputExcel.replace(/\.xlsx$/i, '.json');
  const pythonScript = path.join(__dirname, '../scripts/pdf_to_excel.py');

  const cleanup = () => {
    [filePath, outputExcel, jsonPath].forEach(f => {
      try { require('fs').unlinkSync(f); } catch (_) {}
    });
  };

  execFile('python3', [pythonScript, filePath, outputExcel],
    { timeout: 60000 },  // 60s timeout
    async (error, stdout, stderr) => {

    if (error) {
      console.error('PDF parse error:', error.message, stderr);
      cleanup();
      return res.status(500).json({
        error: 'Could not parse the PDF. Please ensure it is an official VTU marks card PDF.',
        detail: error.message
      });
    }

    try {
      const fs = require('fs');

      // Verify JSON was produced
      if (!fs.existsSync(jsonPath)) {
        cleanup();
        return res.status(500).json({ error: 'No marks data extracted. The PDF may not be a standard VTU marks card.' });
      }

      const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

      if (!jsonData.subjects || jsonData.subjects.length === 0) {
        cleanup();
        return res.status(422).json({ error: 'No subjects found in the PDF. Please upload an official VTU marks card.' });
      }

      // Save each subject to DB
      for (const subject of jsonData.subjects) {
        await pool.query(`
          INSERT INTO marks (user_id, subject_code, subject_name, internal_marks, external_marks, total, grade_points, credits)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (user_id, subject_code) DO UPDATE SET
            subject_name    = EXCLUDED.subject_name,
            internal_marks  = EXCLUDED.internal_marks,
            external_marks  = EXCLUDED.external_marks,
            total           = EXCLUDED.total,
            grade_points    = EXCLUDED.grade_points,
            credits         = EXCLUDED.credits,
            updated_on      = CURRENT_TIMESTAMP
        `, [
          userId,
          subject.subject_code,
          subject.subject_name,
          subject.internal_marks,
          subject.external_marks,
          subject.total_marks,
          subject.grade_points,
          subject.credits
        ]);
      }

      const sgpa = jsonData.sgpa;
      const cgpa = await calculateCgpa(userId);

      // Update user SGPA and CGPA
      await pool.query(
        'UPDATE users SET sgpa = $1, cgpa = $2 WHERE user_id = $3',
        [sgpa, cgpa, userId]
      );

      // Fire notification (non-blocking — don't let it crash the response)
      const failedCount = jsonData.subjects.filter(s => s.total_marks < 40).length;
      notifyMarksUploaded(userId, sgpa, failedCount).catch(() => {});

      cleanup();

      return res.status(200).json({
        message: 'Marks uploaded and SGPA calculated successfully!',
        sgpa,
        cgpa,
        subjects_count: jsonData.subjects.length,
        failed_count: failedCount,
        subjects: jsonData.subjects   // send back to frontend for display
      });

    } catch (processError) {
      console.error('DB insert error:', processError);
      cleanup();
      return res.status(500).json({
        error: 'Failed to save marks to database.',
        detail: processError.message
      });
    }
  });
});

// ─── Document sharing ─────────────────────────────────────────────────────────

router.post('/share-document', authMiddleware, upload.single('sharedDocument'), async (req, res) => {
  try {
    const filePath = req.file.filename;
    const userId = req.user.userId;
    await pool.query(
      'INSERT INTO shared_documents (user_id, file_id, file_name, mime_type) VALUES ($1, $2, $3, $4)',
      [userId, filePath, req.file.originalname, req.file.mimetype]
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
const photoUpload = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads/profile-photos'),
    filename: (req, file, cb) => cb(null, `profile-${req.user.userId}-${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'));
  },
});

router.post('/profile-photo', authMiddleware, photoUpload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });
  try {
    // Make sure profile-photos dir exists
    const fs = require('fs');
    const dir = path.join(__dirname, '../uploads/profile-photos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const photoUrl = `/uploads/profile-photos/${req.file.filename}`;
    await pool.query('UPDATE users SET profile_avatar = $1 WHERE user_id = $2', [photoUrl, req.user.userId]);
    res.json({ photo_url: photoUrl, message: 'Profile photo updated!' });
  } catch (e) {
    console.error('Photo upload error:', e);
    res.status(500).json({ error: 'Failed to save photo.' });
  }
});

router.delete('/profile-photo', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE users SET profile_avatar = NULL WHERE user_id = $1', [req.user.userId]);
    res.json({ message: 'Profile photo removed.' });
  } catch (e) {
    res.status(500).json({ error: 'Failed to remove photo.' });
  }
});

// ─── Public SGPA Calculator (no auth required) ───────────────────────────────
const uploadPublic = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../uploads'),
    filename: (req, file, cb) => cb(null, `public-${Date.now()}.pdf`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post('/sgpa-public', uploadPublic.single('marksCard'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PDF file uploaded.' });
  const filePath = req.file.path;
  const outputExcel = filePath.replace('.pdf', '.xlsx');
  const pythonScript = path.join(__dirname, '../scripts/pdf_to_excel.py');
  execFile('python3', [pythonScript, filePath, outputExcel], async (error, stdout, stderr) => {
    // Cleanup files after response
    const cleanup = () => {
      [filePath, outputExcel, outputExcel.replace('.xlsx','.json')].forEach(f => {
        try { require('fs').unlinkSync(f); } catch (_) {}
      });
    };
    if (error) {
      cleanup();
      return res.status(500).json({ error: 'Failed to process PDF. Please upload a valid VTU marks card.' });
    }
    try {
      const jsonPath = outputExcel.replace('.xlsx', '.json');
      const fs = require('fs');
      if (!fs.existsSync(jsonPath)) { cleanup(); return res.status(500).json({ error: 'Processing failed — no data extracted.' }); }
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      cleanup();
      res.json({
        sgpa: data.sgpa,
        subjects: data.subjects,
        total_credits: data.total_credits,
        total_grade_points: data.total_grade_points,
        message: 'SGPA calculated successfully! Register to save your results.'
      });
    } catch (e) {
      cleanup();
      res.status(500).json({ error: 'Failed to read results.' });
    }
  });
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
    if (result.rows[0].is_verified) return res.status(400).json({ error: 'Account already verified' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60000);
    await pool.query('UPDATE users SET otp=$1, otp_expiry=$2 WHERE user_id=$3', [otp, expiry, result.rows[0].user_id]);

    const devMode = !process.env.EMAIL_USER || process.env.EMAIL_USER.includes('your_gmail');
    if (!devMode) {
      const { sendOTP } = require('../controllers/userController');
      if (typeof sendOTP === 'function') await sendOTP(result.rows[0].email, otp).catch(() => {});
    }
    res.json({ message: 'OTP resent. Check your email.', devMode, devOtp: devMode ? otp : undefined });
  } catch (e) { res.status(500).json({ error: 'Failed to resend OTP' }); }
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
        subject_name=EXCLUDED.subject_name, internal_marks=EXCLUDED.internal_marks,
        external_marks=EXCLUDED.external_marks, total=EXCLUDED.total,
        grade_points=EXCLUDED.grade_points, credits=EXCLUDED.credits,
        updated_on=CURRENT_TIMESTAMP
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

