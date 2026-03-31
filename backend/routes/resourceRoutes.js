const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/resources — list all resources with filters
router.get('/', async (req, res) => {
  try {
    const { department, semester, year_scheme, resource_type, search } = req.query;
    let query = 'SELECT * FROM vtu_resources WHERE 1=1';
    const params = [];
    let i = 1;

    if (department) { query += ` AND department = $${i++}`; params.push(department); }
    if (semester) { query += ` AND semester = $${i++}`; params.push(parseInt(semester)); }
    if (year_scheme) { query += ` AND year_scheme = $${i++}`; params.push(year_scheme); }
    if (resource_type) { query += ` AND resource_type = $${i++}`; params.push(resource_type); }
    if (search) { query += ` AND (title ILIKE $${i++} OR subject_name ILIKE $${i-1} OR subject_code ILIKE $${i-1})`; params.push(`%${search}%`); }

    query += ' ORDER BY department, semester, resource_type, title';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching resources:', err);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// POST /api/resources/download/:id — increment download count
router.post('/download/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE vtu_resources SET download_count = download_count + 1 WHERE resource_id = $1 RETURNING *',
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Resource not found' });
    res.json({ file_url: result.rows[0].file_url, download_count: result.rows[0].download_count });
  } catch (err) {
    res.status(500).json({ error: 'Failed to log download' });
  }
});

// GET /api/resources/departments — list unique departments
router.get('/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT department FROM vtu_resources ORDER BY department');
    res.json(result.rows.map(r => r.department));
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Alias for global search
router.get('/list', async (req, res) => {
  try {
    const { search } = req.query;
    let q = 'SELECT resource_id, title, subject_code, resource_type, file_url FROM vtu_resources WHERE 1=1';
    const params = [];
    if (search) { q += ' AND (title ILIKE $1 OR subject_code ILIKE $1)'; params.push('%'+search+'%'); }
    q += ' LIMIT 10';
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

module.exports = router;
