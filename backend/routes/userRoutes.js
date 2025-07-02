const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');

const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');
const pool = require('../db');
const { calculateSgpa, calculateCgpa, saveSgpaToDb } = require('../utils/sgpaCalculator');

// ===== Multer Setup =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user ? req.user.userId : 'public'}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// ===== User Registration =====
router.post('/register', [
  check('username').isLength({ min: 4 }),
  check('password').isLength({ min: 6 }),
  check('fullName').notEmpty(),
  check('college').notEmpty(),
  check('semester').isInt({ min: 1, max: 8 }),
  check('mobile').isMobilePhone().withMessage('Invalid mobile number'),
  check('branch').notEmpty(),
  check('yearScheme').notEmpty().isLength({ min: 4, max: 4 }).withMessage('Enter valid year scheme'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  return registerUser(req, res);
});


// ===== Login =====
router.post('/login', loginUser);

// ===== Get Profile =====
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT full_name, semester, college, branch, sgpa, cgpa FROM users WHERE user_id = $1',
      [userId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});
// ===== Update Profile =====
router.put('/profile', authMiddleware, updateUserProfile);

// ===== Upload Marks Card (Private) =====
router.post('/upload-marks', authMiddleware, upload.single('marksCard'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const userId = req.user.userId;
    const outputExcel = filePath.replace('.pdf', '.xlsx');
    const pythonScript = path.join(__dirname, '../scripts/pdf_to_excel.py');

    exec(`python "${pythonScript}" "${filePath}" "${outputExcel}"`, async (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('Python error:', error || stderr);
        return res.status(500).json({ error: 'PDF to Excel conversion failed.' });
      }

      try {
        const sgpa = await calculateSgpa(outputExcel, userId);
        await saveSgpaToDb(userId, sgpa);
        const cgpa = await calculateCgpa(userId);
        await pool.query('UPDATE users SET sgpa = $1, cgpa = $2 WHERE user_id = $3', [sgpa, cgpa, userId]);

        res.status(200).json({ message: 'SGPA and CGPA updated successfully' });
      } catch (err) {
        console.error('SGPA/CGPA processing error:', err);
        res.status(500).json({ error: 'Failed to process Excel file.' });
      }
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'File upload failed.' });
  }
});

// ===== Upload Marks Card (Public) =====
router.post('/public-upload', upload.single('marksCard'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputExcel = filePath.replace('.pdf', '.xlsx');
    const pythonScript = path.join(__dirname, '../scripts/pdf_to_excel.py');

    exec(`python "${pythonScript}" "${filePath}" "${outputExcel}"`, async (error, stdout, stderr) => {
      if (error || stderr) {
        console.error('Python error:', error || stderr);
        return res.status(500).json({ error: 'PDF to Excel conversion failed.' });
      }

      try {
        const sgpa = await calculateSgpa(outputExcel, null); // No DB write
        return res.status(200).json({ sgpa });
      } catch (err) {
        console.error('SGPA calculation error:', err);
        res.status(500).json({ error: 'Failed to calculate SGPA.' });
      }
    });
  } catch (err) {
    console.error('Public upload error:', err);
    res.status(500).json({ error: 'Public SGPA upload failed.' });
  }
});

// ===== Share Document =====
router.post('/share-document', authMiddleware, upload.single('sharedDocument'), async (req, res) => {
  try {
    const userId = req.user.userId;
    await pool.query(
      'INSERT INTO shared_documents (user_id, file_id, file_name, mime_type) VALUES ($1, $2, $3, $4)',
      [userId, req.file.filename, req.file.originalname, req.file.mimetype]
    );
    res.status(200).json({ message: 'Document shared successfully' });
  } catch (err) {
    console.error('Share error:', err);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// ===== Get Shared Documents =====
router.get('/shared-documents', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_id, file_name, mime_type FROM shared_documents WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Fetch shared docs error:', err);
    res.status(500).json({ error: 'Failed to fetch shared documents' });
  }
});

// ===== Job Opportunities (Public) =====
router.get('/job-opportunities', async (req, res) => {
  try {
    const jobOpportunities = [
      {
        title: 'Software Engineer Intern',
        company: 'Google',
        description: 'An exciting opportunity...',
        link: 'https://careers.google.com/',
      },
      {
        title: 'Data Analyst',
        company: 'Facebook',
        description: 'Analyze data to make decisions...',
        link: 'https://www.facebookcareers.com/',
      },
    ];
    res.json(jobOpportunities);
  } catch (err) {
    console.error('Job fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch job opportunities' });
  }
});

// ===== Reminders =====
router.post('/reminders', authMiddleware, async (req, res) => {
  const { time, message } = req.body;
  try {
    await pool.query(
      'INSERT INTO reminders (user_id, time_str, message) VALUES ($1, $2, $3)',
      [req.user.userId, time, message]
    );
    res.status(201).json({ message: 'Reminder set successfully' });
  } catch (err) {
    console.error('Set reminder error:', err);
    res.status(500).json({ error: 'Failed to set reminder' });
  }
});

router.get('/reminders', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reminders WHERE user_id = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get reminders error:', err);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// ===== SGPA and CGPA =====
router.get('/sgpa', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT sgpa FROM users WHERE user_id = $1', [req.user.userId]);
    if (!result.rows.length) return res.status(404).json({ error: 'SGPA not found.' });
    res.status(200).json({ sgpa: result.rows[0].sgpa });
  } catch (err) {
    console.error('SGPA error:', err);
    res.status(500).json({ error: 'Failed to fetch SGPA.' });
  }
});

router.get('/cgpa', authMiddleware, async (req, res) => {
  try {
    const cgpa = await calculateCgpa(req.user.userId);
    res.status(200).json({ cgpa });
  } catch (err) {
    console.error('CGPA error:', err);
    res.status(500).json({ error: 'Failed to fetch CGPA' });
  }
});

// ===== Token Refresh =====
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}
function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}
router.post('/token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

module.exports = router;
