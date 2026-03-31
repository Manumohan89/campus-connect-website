const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/scholarships
router.get('/', async (req, res) => {
  const { category, search, min_cgpa, branch } = req.query;
  try {
    let q = 'SELECT * FROM scholarships WHERE is_active=true';
    const params = []; let i = 1;
    if (category) { q += ` AND category=$${i++}`; params.push(category); }
    if (search)   { q += ` AND (name ILIKE $${i++} OR provider ILIKE $${i-1} OR description ILIKE $${i-1})`; params.push(`%${search}%`); }
    if (min_cgpa) { q += ` AND (min_cgpa=0 OR min_cgpa<=$${i++})`; params.push(parseFloat(min_cgpa)); }
    if (branch)   { q += ` AND (eligible_branches='{}' OR $${i++}=ANY(eligible_branches))`; params.push(branch); }
    q += ' ORDER BY min_cgpa DESC, name ASC';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) {
    console.error('Scholarship fetch error:', e.message);
    res.status(500).json({ error: 'Failed to fetch scholarships' });
  }
});

module.exports = router;
