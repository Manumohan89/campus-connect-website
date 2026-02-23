const express = require('express');
const { registerUser, loginUser, getUserProfile, updateUserProfile } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const userModel = require('../models/userModel');  // Import the user model
const multer = require('multer');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const { calculateSgpa, saveSgpaToDb, calculateCgpa } = require('../utils/sgpaCalculator');
const ExcelJS = require('exceljs');
const path = require('path'); 
const { processPdfToExcel } = require('../utils/pdfProcessor');
const { exec } = require('child_process');
// POST route for user registration
router.post('/register', registerUser);

// POST route for user login
router.post('/login', loginUser);

// GET route to fetch the user's profile (requires authentication)
router.get('/profile', authMiddleware, getUserProfile);
// Get user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const sgpa = await calculateSgpa(userId);
    const cgpa = await calculateCgpa(userId);

    await pool.query('UPDATE users SET sgpa = $1, cgpa = $2 WHERE user_id = $3', [sgpa, cgpa, userId]);

    const result = await pool.query('SELECT full_name, semester, college, branch, sgpa, cgpa FROM users WHERE user_id = $1', [userId]);
    const userProfile = result.rows[0];

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
});

// PUT route to update the user's profile (requires authentication)
router.put('/profile', authMiddleware, updateUserProfile);



router.post('/register', [
  check('username').isLength({ min: 5 }).withMessage('Username must be at least 5 characters long'),
  check('email').isEmail().withMessage('Invalid email address'),
  // Add more validations as needed
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Continue with registration logic
});

// GET route to fetch dashboard data (requires authentication)
router.get('/dashboard-data', authMiddleware, async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.userId); // Use userModel to get the user data
        const dashboardData = {
            username: user.username,
            semester: user.semester,
            cgpa: user.cgpa || "N/A",
        };
        res.json(dashboardData);
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
router.post('/reminders', authMiddleware, async (req, res) => {
    const { time, message } = req.body;
    try {
      await pool.query('INSERT INTO reminders (user_id, time_str, message) VALUES ($1, $2, $3)', [
        req.user.userId,
        time,
        message,
      ]);
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


  router.get('/job-opportunities', async (req, res) => {
    try {
      const jobOpportunities = [
        { title: 'Software Engineer Intern', company: 'Google', description: 'An exciting opportunity...', link: 'https://...' },
        { title: 'Data Analyst', company: 'Facebook', description: 'Analyze data to...', link: 'https://...' },
      ];
      res.json(jobOpportunities);
    } catch (error) {
      console.error('Error fetching job opportunities:', error);
      res.status(500).json({ error: 'Failed to fetch job opportunities' });
    }
  });

  // Set up multer for marks card PDF upload
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsPath = path.join(__dirname, '../uploads');
      cb(null, uploadsPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${req.user.userId}-${Date.now()}${ext}`);
    },
  });
  
  const upload = multer({ storage });
  
  router.post('/upload-marks', authMiddleware, upload.single('marksCard'), async (req, res) => {
    try {
      const filePath = req.file.path;
      const userId = req.user.userId;
  
      // Define dynamic paths for input PDF and output Excel
      const outputExcel = filePath.replace('.pdf', '.xlsx');
  
      // Path to the Python script
      const pythonScript = path.join(__dirname, '../scripts/pdf_to_excel.py');
  
      // Execute the Python script with dynamic paths
      exec(`python "${pythonScript}" "${filePath}" "${outputExcel}"`, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error executing Python script: ${error.message}`);
          return res.status(500).json({ error: 'Failed to process marks card. Please ensure it is a valid PDF file.' });
        }
        if (stderr) {
          console.error(`Python script error: ${stderr}`);
          return res.status(500).json({ error: 'Failed to process marks card. Please ensure it is a valid PDF file.' });
        }
  
        console.log(`Conversion complete. Excel file saved at ${outputExcel}`);
  
        // Process the Excel file to calculate SGPA
        try {
          const sgpa = await calculateSgpa(outputExcel, userId);
  
          // Save SGPA to the database
          await saveSgpaToDb(userId, sgpa);
  
          // Update user's CGPA
          const cgpa = await calculateCgpa(userId);
          await pool.query('UPDATE users SET sgpa = $1, cgpa = $2 WHERE user_id = $3', [sgpa, cgpa, userId]);

          const result = await pool.query('SELECT sgpa, cgpa FROM users WHERE user_id = $1', [userId]);
          const { sgpa: updatedSgpa, cgpa: updatedCgpa } = result.rows[0];

  
          res.status(200).json({ message: 'SGPA and CGPA updated successfully' });
        } catch (error) {
          console.error('Error processing Excel file:', error);
          res.status(500).json({ error: 'Failed to process Excel file after conversion.' });
        }
      });
  
    } catch (error) {
      console.error('Error processing marks card:', error);
      res.status(500).json({ error: 'Failed to process marks card. Please ensure it is a valid PDF file.' });
    }
  });
    
router.post('/share-document', authMiddleware, upload.single('sharedDocument'), async (req, res) => {
  try {
    const filePath = req.file.filename;
    const userId = req.user.userId;
    await pool.query('INSERT INTO shared_documents (user_id, file_id, file_name, mime_type) VALUES ($1, $2, $3, $4)', [userId, filePath, req.file.originalname, req.file.mimetype]);
    res.status(200).json({ message: 'Document shared successfully' });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});
router.get('/shared-documents', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT file_id, file_name, mime_type FROM shared_documents WHERE user_id = $1', [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching shared documents:', error);
    res.status(500).json({ error: 'Failed to fetch shared documents' });
  }
});
function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(user) {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

// Route to refresh tokens
router.post('/token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

router.get('/sgpa', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await pool.query('SELECT sgpa FROM users WHERE user_id = $1', [userId]);

    if (result.rows.length === 0 || result.rows[0].sgpa === null) {
      return res.status(404).json({ error: 'SGPA not found.' });
    }

    const sgpa = result.rows[0].sgpa;
    res.status(200).json({ sgpa });
  } catch (error) {
    console.error('Error fetching SGPA:', error);
    res.status(500).json({ error: 'Failed to fetch SGPA.' });
  }
});

router.get('/cgpa', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    const cgpa = await calculateCgpa(userId);

    res.status(200).json({ cgpa });
  } catch (error) {
    console.error('Error fetching CGPA:', error);
    res.status(500).json({ error: 'Failed to fetch CGPA' });
  }
});

  
module.exports = router;
