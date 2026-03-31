const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    filename: (req, file, cb) => cb(null, `community-${Date.now()}${path.extname(file.originalname)}`),
  }),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// ═══════════════════════════════════════════════════════
// ATTENDANCE
// ═══════════════════════════════════════════════════════

router.get('/attendance', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM attendance WHERE user_id=$1 ORDER BY subject_code', [req.user.userId]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch attendance' }); }
});

router.post('/attendance', authMiddleware, async (req, res) => {
  const { subject_code, subject_name, total_classes, attended_classes, semester } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO attendance (user_id, subject_code, subject_name, total_classes, attended_classes, semester)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id, subject_code) DO UPDATE SET
         subject_name=EXCLUDED.subject_name, total_classes=EXCLUDED.total_classes,
         attended_classes=EXCLUDED.attended_classes, semester=EXCLUDED.semester,
         last_updated=CURRENT_TIMESTAMP
       RETURNING *`,
      [req.user.userId, subject_code, subject_name, total_classes, attended_classes, semester]
    );
    res.json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to save attendance' }); }
});

router.delete('/attendance/:subject_code', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM attendance WHERE user_id=$1 AND subject_code=$2', [req.user.userId, req.params.subject_code]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ═══════════════════════════════════════════════════════
// EXAM TIMETABLE
// ═══════════════════════════════════════════════════════

router.get('/timetable', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM exam_timetable WHERE user_id=$1 ORDER BY exam_date ASC', [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch timetable' }); }
});

router.post('/timetable', authMiddleware, async (req, res) => {
  const { subject_code, subject_name, exam_date, exam_time, venue, semester, year_scheme } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO exam_timetable (user_id, subject_code, subject_name, exam_date, exam_time, venue, semester, year_scheme)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user.userId, subject_code, subject_name, exam_date, exam_time||'10:00 AM', venue, semester, year_scheme]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to add exam' }); }
});

router.delete('/timetable/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM exam_timetable WHERE id=$1 AND user_id=$2', [req.params.id, req.user.userId]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: 'Failed to delete' }); }
});

// ═══════════════════════════════════════════════════════
// PLACEMENT DRIVES
// ═══════════════════════════════════════════════════════

router.get('/placements', async (req, res) => {
  try {
    const { branch, status, type, search } = req.query;
    let q = 'SELECT * FROM placement_drives WHERE 1=1';
    const p = [];
    let i = 1;
    if (status) { q += ` AND status=$${i++}`; p.push(status); }
    if (search)  { q += ` AND (company_name ILIKE $${i} OR role ILIKE $${i})`; p.push('%'+search+'%'); i++; }
    if (type) { q += ` AND drive_type=$${i++}`; p.push(type); }
    if (branch) { q += ` AND (eligible_branches @> $${i++} OR eligible_branches IS NULL)`; p.push(`{${branch}}`); }
    q += ' ORDER BY drive_date ASC NULLS LAST';
    const result = await pool.query(q, p);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch drives' }); }
});

// Eligibility check for a drive
router.get('/placements/:id/eligible', authMiddleware, async (req, res) => {
  try {
    const [driveRes, userRes] = await Promise.all([
      pool.query('SELECT * FROM placement_drives WHERE drive_id=$1', [req.params.id]),
      pool.query('SELECT cgpa, branch FROM users WHERE user_id=$1', [req.user.userId]),
    ]);
    if (!driveRes.rows.length) return res.status(404).json({ error: 'Drive not found' });
    const drive = driveRes.rows[0];
    const user = userRes.rows[0];
    const backlogs = await pool.query('SELECT COUNT(*) FROM marks WHERE user_id=$1 AND total < 40', [req.user.userId]);
    const backlogCount = parseInt(backlogs.rows[0].count);
    const isEligible = (
      parseFloat(user.cgpa || 0) >= drive.min_cgpa &&
      backlogCount <= drive.eligible_backlogs &&
      (!drive.eligible_branches?.length || drive.eligible_branches.includes(user.branch))
    );
    res.json({ eligible: isEligible, cgpa: user.cgpa, required_cgpa: drive.min_cgpa, backlogs: backlogCount, allowed_backlogs: drive.eligible_backlogs });
  } catch (e) { res.status(500).json({ error: 'Failed to check eligibility' }); }
});

router.post('/placements/:id/apply', authMiddleware, async (req, res) => {
  try {
    await pool.query(
      'INSERT INTO placement_applications (user_id, drive_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
      [req.user.userId, req.params.id]
    );
    res.json({ message: 'Applied successfully' });
  } catch (e) { res.status(500).json({ error: 'Failed to apply' }); }
});

router.get('/my-applications', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pd.*, pa.applied_at, pa.status as app_status FROM placement_drives pd
       JOIN placement_applications pa ON pd.drive_id = pa.drive_id
       WHERE pa.user_id=$1 ORDER BY pa.applied_at DESC`,
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch applications' }); }
});

// ═══════════════════════════════════════════════════════
// COMMUNITY NOTES & PYQ
// ═══════════════════════════════════════════════════════

router.get('/community', async (req, res) => {
  try {
    const { department, semester, year_scheme, resource_type, search } = req.query;
    let q = `SELECT cr.*, u.full_name as uploader_name FROM community_resources cr
             JOIN users u ON cr.user_id = u.user_id WHERE cr.is_approved=true`;
    const p = [];
    let i = 1;
    if (department) { q += ` AND cr.department=$${i++}`; p.push(department); }
    if (semester) { q += ` AND cr.semester=$${i++}`; p.push(parseInt(semester)); }
    if (year_scheme) { q += ` AND cr.year_scheme=$${i++}`; p.push(year_scheme); }
    if (resource_type) { q += ` AND cr.resource_type=$${i++}`; p.push(resource_type); }
    if (search) { q += ` AND (cr.title ILIKE $${i} OR cr.subject_name ILIKE $${i++})`; p.push(`%${search}%`); }
    q += ' ORDER BY cr.rating_avg DESC, cr.download_count DESC';
    const result = await pool.query(q, p);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch community resources' }); }
});

router.post('/community', authMiddleware, upload.single('file'), async (req, res) => {
  const { title, description, resource_type, subject_code, subject_name, department, semester, year_scheme } = req.body;
  if (!req.file) return res.status(400).json({ error: 'File required' });
  try {
    const result = await pool.query(
      `INSERT INTO community_resources (user_id, title, description, resource_type, subject_code, subject_name, department, semester, year_scheme, file_url, file_name)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [req.user.userId, title, description, resource_type, subject_code, subject_name, department, parseInt(semester)||1, year_scheme, `/uploads/${req.file.filename}`, req.file.originalname]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to upload resource' }); }
});

router.post('/community/:id/rate', authMiddleware, async (req, res) => {
  const { rating } = req.body;
  try {
    await pool.query(
      'INSERT INTO community_ratings (resource_id, user_id, rating) VALUES ($1,$2,$3) ON CONFLICT (resource_id, user_id) DO UPDATE SET rating=$3',
      [req.params.id, req.user.userId, rating]
    );
    // Recalculate avg
    const avg = await pool.query('SELECT AVG(rating), COUNT(*) FROM community_ratings WHERE resource_id=$1', [req.params.id]);
    await pool.query('UPDATE community_resources SET rating_avg=$1, rating_count=$2 WHERE id=$3', [avg.rows[0].avg, avg.rows[0].count, req.params.id]);
    res.json({ message: 'Rated', avg: avg.rows[0].avg });
  } catch (e) { res.status(500).json({ error: 'Failed to rate' }); }
});

router.post('/community/:id/download', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('UPDATE community_resources SET download_count=download_count+1 WHERE id=$1 RETURNING file_url', [req.params.id]);
    res.json({ file_url: result.rows[0]?.file_url });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ═══════════════════════════════════════════════════════
// ALUMNI MENTORSHIP
// ═══════════════════════════════════════════════════════

router.get('/alumni', async (req, res) => {
  try {
    const { branch, company, year, search } = req.query;
    let q = 'SELECT * FROM alumni WHERE is_available=true';
    const p = [];
    let i = 1;
    if (branch) { q += ` AND branch=$${i++}`; p.push(branch); }
    if (company) { q += ` AND current_company ILIKE $${i++}`; p.push(`%${company}%`); }
    if (year) { q += ` AND graduation_year=$${i++}`; p.push(parseInt(year)); }
    q += ' ORDER BY graduation_year DESC';
    const result = await pool.query(q, p);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch alumni' }); }
});

router.post('/alumni/:id/connect', authMiddleware, async (req, res) => {
  const { message } = req.body;
  try {
    await pool.query(
      'INSERT INTO mentorship_requests (student_id, alumni_id, message) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING',
      [req.user.userId, req.params.id, message]
    );

    // Notify the alumni by email
    try {
      const [alumniRes, studentRes] = await Promise.all([
        pool.query('SELECT email, full_name FROM alumni WHERE id=$1', [req.params.id]),
        pool.query('SELECT full_name, branch, college FROM users WHERE user_id=$1', [req.user.userId]),
      ]);
      const alumni = alumniRes.rows[0];
      const student = studentRes.rows[0];
      if (alumni?.email && student) {
        const { sendEmail } = require('../controllers/userController');
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
        const html = '<h2 style="color:#111827;margin:0 0 16px;">New Mentorship Request</h2>' +
          '<p style="color:#374151;line-height:1.7;">Hi <strong>' + (alumni.full_name || 'Alumni') + '</strong>,</p>' +
          '<p style="color:#374151;line-height:1.7;">A VTU student has reached out to you for mentorship through Campus Connect.</p>' +
          '<div style="background:#EEF2FF;border-radius:12px;padding:20px;margin:20px 0;">' +
            '<p style="color:#4338CA;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin:0 0 12px;">Student Message</p>' +
            '<p style="color:#1E1B4B;font-size:15px;font-style:italic;margin:0;">&ldquo;' + message + '&rdquo;</p>' +
          '</div>' +
          '<p style="color:#374151;">From: <strong>' + (student.full_name || 'Student') + '</strong>' +
            (student.branch ? ' · ' + student.branch : '') +
            (student.college ? ' · ' + student.college : '') + '</p>' +
          '<p style="margin-top:24px;"><a href="' + clientUrl + '/alumni-mentorship" style="background:linear-gradient(135deg,#4F46E5,#7C3AED);color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;">View Request on Campus Connect</a></p>' +
          '<p style="color:#9CA3AF;font-size:13px;margin-top:20px;">To reply, contact the student directly through the platform or respond to their message on your profile.</p>';
        sendEmail(alumni.email, 'New mentorship request from ' + (student.full_name || 'a VTU student'), html).catch(e => console.error('Alumni email err:', e.message));
      }
    } catch (emailErr) {
      console.error('Alumni notification error:', emailErr.message);
    }

    res.json({ message: 'Connection request sent!' });
  } catch (e) { res.status(500).json({ error: 'Failed to send request' }); }
});

// ═══════════════════════════════════════════════════════
// REVALUATION FORM
// ═══════════════════════════════════════════════════════

router.get('/revaluation', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM revaluation_requests WHERE user_id=$1 ORDER BY created_at DESC', [req.user.userId]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch' }); }
});

router.post('/revaluation', authMiddleware, async (req, res) => {
  const { subject_code, subject_name, semester, usn, reason } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO revaluation_requests (user_id, subject_code, subject_name, semester, usn, reason, status, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6,'submitted', CURRENT_TIMESTAMP) RETURNING *`,
      [req.user.userId, subject_code, subject_name, semester, usn, reason]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to submit' }); }
});

// ═══════════════════════════════════════════════════════
// RANK PREDICTOR
// ═══════════════════════════════════════════════════════

router.get('/rank', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRes = await pool.query('SELECT cgpa, branch, college FROM users WHERE user_id=$1', [userId]);
    const user = userRes.rows[0];
    if (!user.cgpa) return res.json({ rank: null, percentile: null, message: 'Upload marks first' });

    // Compare against all users with same branch (approximation)
    const allRes = await pool.query(
      'SELECT cgpa FROM users WHERE branch=$1 AND cgpa IS NOT NULL AND cgpa > 0 ORDER BY cgpa DESC',
      [user.branch]
    );
    const allCgpas = allRes.rows.map(r => parseFloat(r.cgpa));
    const rank = allCgpas.filter(c => c > parseFloat(user.cgpa)).length + 1;
    const percentile = ((allCgpas.length - rank + 1) / allCgpas.length * 100).toFixed(1);
    res.json({
      rank, total: allCgpas.length, percentile,
      your_cgpa: user.cgpa, branch: user.branch,
      top_cgpa: allCgpas[0] || user.cgpa,
      avg_cgpa: (allCgpas.reduce((a, b) => a + b, 0) / (allCgpas.length || 1)).toFixed(2),
    });
  } catch (e) { res.status(500).json({ error: 'Failed to calculate rank' }); }
});

// ═══════════════════════════════════════════════════════
// SGPA HISTORY (for CGPA trend chart)
// ═══════════════════════════════════════════════════════

router.get('/sgpa-history', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sgpa_history WHERE user_id=$1 ORDER BY semester', [req.user.userId]);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch SGPA history' }); }
});

router.post('/sgpa-history', authMiddleware, async (req, res) => {
  const { semester, sgpa, credits } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO sgpa_history (user_id, semester, sgpa, credits)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT DO NOTHING RETURNING *`,
      [req.user.userId, semester, sgpa, credits || 0]
    );
    res.json(result.rows[0] || { message: 'Already exists' });
  } catch (e) { res.status(500).json({ error: 'Failed to save' }); }
});


// ═══════════════════════════════════════════════════════
// MOCK TEST SAVE
// ═══════════════════════════════════════════════════════

router.post('/mock-test', authMiddleware, async (req, res) => {
  const { subject_code, questions, score, total_questions, time_taken_seconds } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO mock_tests (user_id, subject_code, subject_name, questions, score, total_questions, time_taken_seconds)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.user.userId, subject_code, '', JSON.stringify(questions), score, total_questions, time_taken_seconds]
    );
    res.status(201).json(result.rows[0]);
  } catch (e) { res.status(500).json({ error: 'Failed to save test' }); }
});

router.get('/mock-tests', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, subject_code, score, total_questions, time_taken_seconds, completed_at FROM mock_tests WHERE user_id=$1 ORDER BY completed_at DESC LIMIT 20',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch tests' }); }
});

module.exports = router;
