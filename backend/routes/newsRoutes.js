const express = require('express');
const router = express.Router();
const pool = require('../db');
const crypto = require('crypto');

// ── GET /api/news ────────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { category, limit = 20 } = req.query;
  try {
    let q = 'SELECT * FROM vtu_news WHERE 1=1';
    const params = [];
    if (category) { q += ' AND category=$1'; params.push(category); }
    q += ` ORDER BY fetched_at DESC LIMIT ${parseInt(limit)}`;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch news' }); }
});

// Seed function (callable internally or via POST)
async function seedNews() {
  const sampleNews = [
    { title: 'VTU announces December 2024 Examination Timetable', category: 'exam', url: 'https://vtu.ac.in/examination-time-tables/', content: 'VTU has released the timetable for odd semester examinations. Students are advised to check the official portal.' },
    { title: 'VTU B.E/B.Tech 2022 Scheme Revised Syllabus Released', category: 'syllabus', url: 'https://vtu.ac.in/syllabus/', content: 'Revised syllabus for 2022 scheme students has been uploaded on VTU website. Check your subject changes.' },
    { title: 'Online Fee Payment for Re-evaluation Open', category: 'revaluation', url: 'https://vtu.ac.in/fee-payment/', content: 'Students who wish to apply for re-evaluation/re-totaling can pay the fee online at VTU portal.' },
    { title: 'VTU Results for Aug/Sep 2024 Declared', category: 'results', url: 'https://results.vtu.ac.in/', content: 'Results for all branches semester examinations held in Aug/Sep 2024 have been declared. Check vtu.ac.in' },
    { title: 'Campus Connect: New Coding Platform with 50+ DSA Problems Added', category: 'platform', url: '/coding', content: 'Practice DSA problems in Python, Java, C, C# — LeetCode style. New problems added weekly.' },
    { title: 'VTU 2025 Scheme Curriculum Released for First Year', category: 'syllabus', url: 'https://vtu.ac.in/syllabus/', content: 'VTU has officially released the 2025 scheme curriculum for all first-year programs.' },
  ];
  let inserted = 0;
  for (const item of sampleNews) {
    const hash = crypto.createHash('md5').update(item.title).digest('hex');
    try {
      await pool.query(
        'INSERT INTO vtu_news (title, category, url, content, content_hash, published_at, fetched_at) VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) ON CONFLICT (content_hash) DO NOTHING',
        [item.title, item.category, item.url, item.content, hash]
      );
      inserted++;
    } catch {}
  }
  return inserted;
}

// ── POST /api/news/seed — seed sample news (admin use) ───────────────────────
router.post('/seed', async (req, res) => {
  const inserted = await seedNews().catch(() => 0);
  res.json({ message: `Seeded ${inserted} news items` });
});

module.exports = router;

module.exports.seedNews = seedNews;
