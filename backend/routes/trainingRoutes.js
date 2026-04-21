const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/training/courses
router.get('/courses', async (req, res) => {
  try {
    const { category, department, semester, year_scheme, search } = req.query;
    let query = 'SELECT * FROM training_courses WHERE 1=1';
    const params = []; let i = 1;
    if (category) { query += ` AND category = $${i++}`; params.push(category); }
    if (department) { query += ` AND (department = $${i++} OR department = 'ALL')`; params.push(department); }
    if (semester) { query += ` AND (semester = $${i++} OR semester IS NULL)`; params.push(semester); }
    if (year_scheme) { query += ` AND (year_scheme = $${i++} OR year_scheme IS NULL)`; params.push(year_scheme); }
    if (search) { query += ` AND (title ILIKE $${i++} OR description ILIKE $${i-1})`; params.push(`%${search}%`); }
    query += ' ORDER BY category, title';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// GET /api/training/courses/:id
router.get('/courses/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM training_courses WHERE course_id = $1', [req.params.id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Course not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// POST /api/training/enroll
router.post('/enroll', authMiddleware, async (req, res) => {
  const { course_id } = req.body;
  const user_id = req.user.userId;
  
  // Validate course_id is provided
  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required' });
  }
  
  try {
    // Verify course exists before attempting enrollment
    const courseCheck = await pool.query(
      'SELECT 1 FROM training_courses WHERE course_id = $1',
      [course_id]
    );
    if (!courseCheck.rows.length) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    const result = await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) ON CONFLICT (user_id, course_id) DO NOTHING RETURNING id',
      [user_id, course_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(409).json({ message: 'Already enrolled in this course' });
    }
    
    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('❌ Enrollment error for user', user_id, 'course', course_id, ':', err.message);
    if (process.env.NODE_ENV !== 'production') console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Enrollment failed: ' + err.message });
  }
});

// GET /api/training/my-courses
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tc.*, e.progress, e.enrolled_at, e.completed_at, e.certificate_issued, e.certificate_id
      FROM training_courses tc
      JOIN enrollments e ON tc.course_id = e.course_id
      WHERE e.user_id = $1
      ORDER BY e.enrolled_at DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch enrolled courses' });
  }
});

// PUT /api/training/progress
router.put('/progress', authMiddleware, async (req, res) => {
  const { course_id, progress } = req.body;
  const user_id = req.user.userId;
  try {
    const completed_at = progress >= 100 ? new Date() : null;
    const certificate_issued = progress >= 100;

    // Generate certificate ID on completion
    let certificate_id = null;
    if (progress >= 100) {
      const existing = await pool.query(
        'SELECT certificate_id FROM enrollments WHERE user_id=$1 AND course_id=$2',
        [user_id, course_id]
      );
      if (existing.rows[0]?.certificate_id) {
        certificate_id = existing.rows[0].certificate_id;
      } else {
        const rand = require('crypto').randomBytes(4).toString('hex').toUpperCase();
        certificate_id = 'CC-' + new Date().getFullYear() + '-' + rand;
      }
    }

    await pool.query(
      'UPDATE enrollments SET progress=$1, completed_at=$2, certificate_issued=$3, certificate_id=$4 WHERE user_id=$5 AND course_id=$6',
      [progress, completed_at, certificate_issued, certificate_id, user_id, course_id]
    );

    // Send completion email
    if (progress >= 100 && certificate_id) {
      try {
        const [userRes, courseRes] = await Promise.all([
          pool.query('SELECT email, full_name FROM users WHERE user_id=$1', [user_id]),
          pool.query('SELECT title FROM training_courses WHERE course_id=$1', [course_id]),
        ]);
        const user = userRes.rows[0];
        const course = courseRes.rows[0];
        if (user && course) {
          const { sendEmail } = require('../controllers/userController');
          const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
          const certUrl = clientUrl + '/certificate/' + certificate_id;
          const emailHtml = `
<div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
  <div style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:40px 32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:8px;">🎓</div>
    <h1 style="color:white;margin:0;font-size:26px;font-weight:800;">Certificate of Completion</h1>
    <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:15px;">Campus Connect — VTU Student Portal</p>
  </div>
  <div style="background:white;padding:32px;">
    <p style="font-size:16px;color:#374151;margin:0 0 16px;">Dear <strong>${user.full_name || 'Student'}</strong>,</p>
    <p style="color:#374151;line-height:1.7;margin:0 0 24px;">Congratulations on completing <strong>${course.title}</strong>! Your hard work and dedication have paid off. Your official certificate has been issued and is ready for download.</p>
    <div style="background:#F5F3FF;border:2px solid #DDD6FE;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
      <p style="color:#6D28D9;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 8px;">Certificate ID</p>
      <p style="color:#1E1B4B;font-size:28px;font-weight:900;font-family:monospace;margin:0;letter-spacing:0.05em;">${certificate_id}</p>
      <p style="color:#6D28D9;font-size:12px;margin:8px 0 0;">Keep this ID for verification</p>
    </div>
    <div style="text-align:center;margin:0 0 24px;">
      <a href="${certUrl}" style="display:inline-block;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;padding:14px 36px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">⬇ Download Certificate</a>
    </div>
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;">
    <p style="color:#9CA3AF;font-size:13px;margin:0;">Continue your learning journey at <a href="${clientUrl}/training" style="color:#4F46E5;">Campus Connect Training</a>. Explore more courses and boost your placement profile.</p>
  </div>
  <div style="background:#F9FAFB;padding:16px 32px;text-align:center;border-top:1px solid #e5e7eb;">
    <p style="color:#9CA3AF;font-size:12px;margin:0;">© 2025 Campus Connect · VTU Student Portal · <a href="${clientUrl}/unsubscribe" style="color:#9CA3AF;">Unsubscribe</a></p>
  </div>
</div>`;
          sendEmail(user.email, 'Certificate Issued: ' + course.title, emailHtml).catch(e => console.error('Cert email err:', e));
        }
      } catch (e) {
        console.error('Cert email process err:', e.message);
      }
    }

    res.json({ message: 'Progress updated', certificate_issued, certificate_id });
  } catch (err) {
    console.error('Progress update error:', err);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/training/recommended
router.get('/recommended', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const failed = await pool.query(
      'SELECT subject_code, subject_name FROM marks WHERE user_id = $1 AND is_failed = true',
      [userId]
    );
    if (!failed.rows.length) return res.json({ failed_subjects: [], recommended_courses: [] });
    const failedCodes = failed.rows.map(r => r.subject_code);
    const courses = await pool.query(
      'SELECT * FROM training_courses WHERE subject_code = ANY($1) OR category = $2',
      [failedCodes, 'backlog_clearing']
    );
    res.json({ failed_subjects: failed.rows, recommended_courses: courses.rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// GET /api/training/certificate/:cert_id — public certificate lookup
router.get('/certificate/:cert_id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.certificate_id, e.completed_at, e.progress,
             u.full_name, u.college, u.branch,
             tc.title as course_title, tc.category, tc.duration_hours, tc.instructor, tc.has_certificate
      FROM enrollments e
      JOIN users u ON e.user_id = u.user_id
      JOIN training_courses tc ON e.course_id = tc.course_id
      WHERE e.certificate_id = $1 AND e.certificate_issued = true
    `, [req.params.cert_id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Certificate not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificate' });
  }
});

// GET /api/training/my-certificates
router.get('/my-certificates', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.certificate_id, e.completed_at, tc.title, tc.category, tc.duration_hours, tc.instructor
      FROM enrollments e
      JOIN training_courses tc ON e.course_id = tc.course_id
      WHERE e.user_id = $1 AND e.certificate_issued = true
      ORDER BY e.completed_at DESC
    `, [req.user.userId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

module.exports = router;
