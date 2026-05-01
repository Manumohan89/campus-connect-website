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
  const user_id = req.user?.userId;
  
  // Validate inputs
  if (!user_id) {
    console.error('❌ Enroll: No user_id in request');
    return res.status(401).json({ error: 'User not authenticated' });
  }
  if (!course_id) {
    return res.status(400).json({ error: 'course_id is required' });
  }
  
  try {
    // Verify course exists before attempting enrollment
    const courseCheck = await pool.query(
      'SELECT course_id FROM training_courses WHERE course_id = $1 LIMIT 1',
      [course_id]
    );
    if (!courseCheck.rows.length) {
      return res.status(404).json({ error: 'Course not found' });
    }
    
    // Attempt enrollment with conflict handling
    const result = await pool.query(
      `INSERT INTO enrollments (user_id, course_id, enrolled_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (user_id, course_id) DO NOTHING 
       RETURNING id`,
      [user_id, course_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(200).json({ message: 'Already enrolled in this course' });
    }
    
    res.status(201).json({ message: 'Enrolled successfully', enrollment_id: result.rows[0].id });
  } catch (err) {
    console.error('❌ Enrollment error for user', user_id, 'course', course_id, ':', err.message);
    if (process.env.NODE_ENV !== 'production') console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Enrollment failed: ' + err.message });
  }
});

// GET /api/training/my-courses
router.get('/my-courses', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT tc.*, e.progress, e.enrolled_at, e.completed_at, e.certificate_issued, e.certificate_id,
             e.certificate_status, e.review_remark, e.reviewed_at
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
    const courseRes = await pool.query('SELECT has_certificate, title FROM training_courses WHERE course_id=$1', [course_id]);
    if (!courseRes.rows.length) return res.status(404).json({ error: 'Course not found' });
    const hasCertificate = !!courseRes.rows[0].has_certificate;
    const nextStatus = hasCertificate
      ? (progress >= 100 ? 'pending_review' : 'in_progress')
      : 'not_applicable';

    // Certificate is no longer auto-issued on completion.
    // It must be approved by admin/course coordinator.
    await pool.query(
      `UPDATE enrollments
       SET progress=$1,
           completed_at=$2,
           certificate_status=$3,
           review_remark=CASE WHEN $3='pending_review' THEN NULL ELSE review_remark END,
           reviewed_at=CASE WHEN $3='pending_review' THEN NULL ELSE reviewed_at END,
           reviewed_by=CASE WHEN $3='pending_review' THEN NULL ELSE reviewed_by END
       WHERE user_id=$4 AND course_id=$5`,
      [progress, completed_at, nextStatus, user_id, course_id]
    );

    // Notify student that certificate request is submitted for review.
    if (progress >= 100) {
      try {
        const [courseTitleRes, certStateRes] = await Promise.all([
          pool.query('SELECT title FROM training_courses WHERE course_id=$1', [course_id]),
          pool.query('SELECT certificate_issued FROM enrollments WHERE user_id=$1 AND course_id=$2', [user_id, course_id]),
        ]);
        const course = courseTitleRes.rows[0];
        const certIssued = !!certStateRes.rows[0]?.certificate_issued;
        if (course && !certIssued) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)',
            [
              user_id,
              'announcement',
              '📨 Certificate Review Submitted',
              `You completed "${course.title}". Your certificate will be issued after review by the course coordinator/admin.`,
              '/training',
            ]
          );
        }
      } catch (e) {
        console.error('Certificate review notification error:', e.message);
      }
    }

    res.json({
      message: progress >= 100
        ? 'Course marked complete. Certificate is pending coordinator/admin review.'
        : 'Progress updated',
      certificate_issued: false,
      certificate_pending_review: progress >= 100 && hasCertificate,
      certificate_status: nextStatus,
      certificate_id: null
    });
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
