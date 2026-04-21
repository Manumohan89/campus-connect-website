const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// ── GET /api/internships — list active programs ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    let q = `SELECT p.*,
      (SELECT COUNT(*) FROM internship_applications a WHERE a.program_id = p.id) AS applicants_count
      FROM internship_programs p WHERE p.is_active = true`;
    const params = [];
    if (category && category !== 'all') { params.push(category); q += ` AND p.category = $${params.length}`; }
    if (search) { params.push(`%${search}%`); q += ` AND (p.title ILIKE $${params.length} OR p.company ILIKE $${params.length} OR p.description ILIKE $${params.length})`; }
    q += ' ORDER BY p.created_at DESC';
    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ── GET /api/internships/:id — single program ────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM internship_applications a WHERE a.program_id = p.id) AS applicants_count
       FROM internship_programs p WHERE p.id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

// ── POST /api/internships/:id/apply — student applies ────────────────────────
router.post('/:id/apply', authMiddleware, async (req, res) => {
  const { student_message } = req.body;
  const program_id = req.params.id;
  const user_id = req.user.userId;
  try {
    // Check if program exists and is active
    const { rows: prog } = await pool.query(
      'SELECT * FROM internship_programs WHERE id = $1 AND is_active = true', [program_id]);
    if (!prog.length) return res.status(404).json({ error: 'Program not found or inactive' });

    // Check if seats available
    const { rows: appRows } = await pool.query(
      'SELECT COUNT(*) FROM internship_applications WHERE program_id = $1', [program_id]);
    if (prog[0].seats && parseInt(appRows[0].count) >= prog[0].seats) {
      return res.status(400).json({ error: 'No seats available' });
    }

    const { rows } = await pool.query(
      `INSERT INTO internship_applications (program_id, user_id, student_message)
       VALUES ($1, $2, $3)
       ON CONFLICT (program_id, user_id) DO NOTHING
       RETURNING *`,
      [program_id, user_id, student_message || null]
    );
    if (!rows.length) return res.status(409).json({ error: 'Already applied' });
    res.status(201).json({ success: true, application: rows[0] });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
});

// ── GET /api/internships/my/applications — user's applications ───────────────
router.get('/my/applications', authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, p.title, p.company, p.duration, p.stipend, p.has_certificate, p.has_training_cert,
              p.skills_covered, p.mode, p.logo_url
       FROM internship_applications a
       JOIN internship_programs p ON p.id = a.program_id
       WHERE a.user_id = $1
       ORDER BY a.applied_at DESC`,
      [req.user.userId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Server error' }); }
});

module.exports = router;
