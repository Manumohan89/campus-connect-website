const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/authMiddleware');

// Recalculate leaderboard scores for all users
async function rebuildLeaderboard() {
  try {
    const users = await pool.query(`
      SELECT u.user_id, u.cgpa, u.branch,
        COALESCE((SELECT COUNT(*) FROM user_solved_problems WHERE user_id=u.user_id),0) as coding_solved,
        COALESCE((SELECT COUNT(*) FROM enrollments WHERE user_id=u.user_id AND certificate_issued=true),0) as courses_done,
        COALESCE((SELECT AVG(CAST(attended_classes AS FLOAT)/NULLIF(total_classes,0)*100) FROM attendance WHERE user_id=u.user_id),0) as avg_attendance,
        COALESCE((SELECT COUNT(*) FROM forum_answers fa WHERE fa.user_id=u.user_id AND fa.is_accepted=true),0) as accepted_answers
      FROM users u WHERE u.is_blocked=false AND u.role='user'
    `);
    for (const u of users.rows) {
      const cgpa_s = Math.min(parseFloat(u.cgpa || 0) * 3, 30);
      const coding_s = Math.min(parseInt(u.coding_solved) * 2, 30);
      const course_s = Math.min(parseInt(u.courses_done) * 5, 20);
      const att_s = Math.min(parseFloat(u.avg_attendance || 0) * 0.1, 10);
      const forum_s = Math.min(parseInt(u.accepted_answers) * 3, 10);
      const score = cgpa_s + coding_s + course_s + att_s + forum_s;

      // Compute badges
      const badges = [];
      if (parseFloat(u.cgpa) >= 9) badges.push('CGPA 9+');
      if (parseInt(u.coding_solved) >= 50) badges.push('Coding Master');
      if (parseInt(u.courses_done) >= 5) badges.push('Course Champion');
      if (parseFloat(u.avg_attendance) >= 90) badges.push('Full Attendance');
      if (parseInt(u.accepted_answers) >= 10) badges.push('Forum Expert');

      await pool.query(
        `INSERT INTO leaderboard_cache (user_id, score, cgpa_score, coding_score, course_score, attendance_score, forum_score, badges, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
         ON CONFLICT (user_id) DO UPDATE SET score=$2,cgpa_score=$3,coding_score=$4,course_score=$5,attendance_score=$6,forum_score=$7,badges=$8,updated_at=NOW()`,
        [u.user_id, score, cgpa_s, coding_s, course_s, att_s, forum_s, badges]
      );
    }
    console.log(`✅ Leaderboard rebuilt for ${users.rows.length} users`);
  } catch (e) { console.error('Leaderboard rebuild error:', e.message); }
}

// ── GET /api/leaderboard ─────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  const { branch, limit = 50, type = 'overall' } = req.query;
  try {
    let q = `SELECT lc.*, u.username, u.full_name, u.branch, u.cgpa, u.profile_avatar,
      RANK() OVER (ORDER BY lc.score DESC) as rank
      FROM leaderboard_cache lc JOIN users u ON lc.user_id=u.user_id
      WHERE u.is_blocked=false`;
    const params = [];
    if (branch) { q += ` AND u.branch=$1`; params.push(branch); }
    q += ` ORDER BY lc.score DESC LIMIT ${parseInt(limit)}`;
    const result = await pool.query(q, params);
    res.json(result.rows);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch leaderboard' }); }
});

// ── GET /api/leaderboard/my-rank ─────────────────────────────────────────────
router.get('/my-rank', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lc.*, RANK() OVER (ORDER BY lc.score DESC) as rank,
        (SELECT COUNT(*) FROM leaderboard_cache) as total_users
       FROM leaderboard_cache lc WHERE lc.user_id=$1`,
      [req.user.userId]
    );
    res.json(result.rows[0] || { score: 0, rank: null, badges: [] });
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

// ── POST /api/leaderboard/rebuild (admin only) ────────────────────────────────
router.post('/rebuild', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  await rebuildLeaderboard();
  res.json({ message: 'Leaderboard rebuilt' });
});

// Schedule rebuild every 6 hours
setInterval(rebuildLeaderboard, 6 * 60 * 60 * 1000);

// Smart startup: only rebuild if cache is empty OR stale (>6h old)
setTimeout(async () => {
  try {
    const pool = require('../db');
    const result = await pool.query(
      'SELECT updated_at FROM leaderboard_cache ORDER BY updated_at DESC LIMIT 1'
    );
    if (!result.rows.length) {
      console.log('Leaderboard cache empty — rebuilding...');
      await rebuildLeaderboard();
    } else {
      const ageHours = (Date.now() - new Date(result.rows[0].updated_at)) / 3600000;
      if (ageHours > 6) {
        console.log(`Leaderboard stale (${ageHours.toFixed(1)}h) — rebuilding...`);
        await rebuildLeaderboard();
      } else {
        console.log(`Leaderboard fresh (${ageHours.toFixed(1)}h old) — skipping rebuild`);
      }
    }
  } catch (e) { /* Table might not exist yet on first deploy — ignore */ }
}, 15000); // Wait 15s for migrations to complete

module.exports = router;
module.exports.rebuildLeaderboard = rebuildLeaderboard;
